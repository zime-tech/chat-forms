"use client";

import {
  FormAssistantResponse,
  FormSettings,
  sendMessage as serverSendMessage,
  createFormSessionAction,
} from "@/actions/form-assistant";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Message } from "@ai-sdk/react";
import { ExtendedMessage } from "@/db/schema";

interface FormAssistantClientProps {
  sessionId?: string;
  formId: string;
  formSettings: FormSettings;
  hideHeader?: boolean;
}

export default function FormAssistantClient({
  sessionId: initialSessionId,
  formId,
  formSettings,
  hideHeader,
}: FormAssistantClientProps) {
  const searchParams = useSearchParams();
  const prefillMessage = searchParams.get("msg");
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [started, setStarted] = useState(false);
  const [prefillUsed, setPrefillUsed] = useState(false);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allMessages, setAllMessages] = useState<ExtendedMessage[]>([]);

  const { messages, isLoading, error, clearError, handleSubmit } = useChat({
    sendMessage: async (formId: string, message: Message): Promise<Message[]> => {
      if (!sessionId) throw new Error("Session not initialized");

      const currentMessages = [...allMessages, message];
      setAllMessages(currentMessages);

      const result = await serverSendMessage(formId, sessionId, message);
      const assistantMessage = result[result.length - 1] as ExtendedMessage;

      if (!assistantMessage || assistantMessage.role !== "assistant") {
        throw new Error("Failed to get a response. Please try again.");
      }

      const updatedMessages = [...currentMessages, assistantMessage];
      setAllMessages(updatedMessages);
      return updatedMessages;
    },
    formId,
    initialMessages: [
      {
        id: "initial-message",
        role: "assistant",
        content: formSettings.welcomeMessage,
      },
    ],
  });

  const [inputValue, setInputValue] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out the "start_form" user message from display
  const visibleMessages = messages.filter(
    (m) => !(m.role === "user" && m.content === "start_form")
  );

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i] as ExtendedMessage;
        if (message.role === "assistant" && message.responseData) {
          if ("formCompleted" in message.responseData) {
            if (message.responseData.formCompleted) {
              setIsFormCompleted(true);
              setProgress(100);
            }
            if ("progressPercentage" in message.responseData) {
              setProgress(message.responseData.progressPercentage as number);
            }
            break;
          }
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && inputRef.current && started) {
      inputRef.current.focus();
    }
  }, [isLoading, messages.length, started]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUserMessage(inputValue);
      handleSubmit(e);
    }
  };

  const handleStartClick = async () => {
    if (!sessionId) {
      const newSession = await createFormSessionAction(formId);
      setSessionId(newSession.id);
    }

    setStarted(true);
    setUserMessage("start_form");
    setInputValue("start_form");

    const fakeEvent = {
      preventDefault: () => {},
      target: { elements: { 0: { value: "start_form" } } },
    } as unknown as React.FormEvent<HTMLFormElement>;
    handleSubmit(fakeEvent);
  };

  const handleStartWithMessage = useCallback(async (msg: string) => {
    let sid = sessionId;
    if (!sid) {
      const newSession = await createFormSessionAction(formId);
      sid = newSession.id;
      setSessionId(sid);
    }

    setStarted(true);
    setUserMessage(msg);
    setInputValue(msg);

    const fakeEvent = {
      preventDefault: () => {},
      target: { elements: { 0: { value: msg } } },
    } as unknown as React.FormEvent<HTMLFormElement>;
    handleSubmit(fakeEvent);
  }, [sessionId, formId, handleSubmit]);

  // Auto-start with prefilled message from URL params
  useEffect(() => {
    if (prefillMessage && !prefillUsed && !started) {
      setPrefillUsed(true);
      handleStartWithMessage(prefillMessage);
    }
  }, [prefillMessage, prefillUsed, started, handleStartWithMessage]);

  useEffect(() => {
    if (!isLoading && userMessage) {
      setInputValue("");
      setUserMessage("");
    }
  }, [isLoading]);

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Header for standalone form pages */}
      {!hideHeader && (
        <header className="flex h-14 items-center border-b border-border bg-surface px-6 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquareText size={18} className="text-accent" />
            <span className="font-semibold text-foreground">Chat Forms</span>
          </div>
        </header>
      )}

      {/* Title and progress bar */}
      <div className="text-center px-6 pt-6 pb-2 shrink-0">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {formSettings.title}
        </p>
        {started && !isFormCompleted && (
          <div className="mx-auto mt-3 max-w-xs">
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress > 0 && (
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                {progress}% complete
              </p>
            )}
          </div>
        )}
      </div>

      {/* Conversation area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        <div className="mx-auto w-full max-w-lg space-y-4">
          {/* Message history */}
          {visibleMessages.map((msg, i) => {
            const isLast =
              i === visibleMessages.length - 1 ||
              (i === visibleMessages.length - 2 &&
                visibleMessages[visibleMessages.length - 1].role === "user");

            return msg.role === "assistant" ? (
              <div
                key={msg.id}
                className={`rounded-xl border border-border bg-surface p-5 transition-opacity ${
                  isLast ? "opacity-100" : "opacity-70"
                }`}
              >
                <p className="text-base leading-relaxed text-foreground">
                  {msg.content}
                </p>
              </div>
            ) : (
              <div key={msg.id} className="flex justify-end">
                <div className="rounded-xl bg-accent/10 px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-foreground">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Current user message while loading */}
          {isLoading && userMessage && userMessage !== "start_form" && (
            <div className="flex justify-end">
              <div className="rounded-xl bg-accent/10 px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground">{userMessage}</p>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Processing...</span>
            </div>
          )}

          {/* Completion card */}
          {isFormCompleted && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-success" />
              <p className="text-foreground">
                {formSettings.endScreenMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom input area */}
      <div className="shrink-0 border-t border-border bg-background px-6 py-4">
        <div className="mx-auto w-full max-w-lg">
          {!started ? (
            <div className="flex justify-center">
              <button
                onClick={handleStartClick}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
              >
                {formSettings.callToAction}
                <ArrowRight size={16} />
              </button>
            </div>
          ) : !isFormCompleted ? (
            <form onSubmit={onSubmit} className="relative">
              <textarea
                ref={inputRef}
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Type your response..."
                maxLength={1000}
                disabled={isLoading}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) {
                      const form = e.currentTarget.closest("form");
                      form?.requestSubmit();
                    }
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
                className="absolute right-2 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground disabled:opacity-30 transition-opacity"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </form>
          ) : null}

          {/* Error state */}
          {error && (
            <div role="alert" className="mt-3 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <AlertCircle size={16} className="shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-foreground">
                {error.toLowerCase().includes("too many requests")
                  ? "You're sending messages too quickly. Please wait a moment and try again."
                  : error}
              </p>
              <button
                onClick={clearError}
                className="inline-flex items-center gap-1 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors border border-border"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Powered-by footer — only on standalone public form pages */}
      {!hideHeader && (
        <footer className="border-t border-border bg-surface px-6 py-3 text-center shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Powered by{" "}
            <a
              href="/"
              className="font-medium text-accent hover:underline"
            >
              Chat Forms
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}

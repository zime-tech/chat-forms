"use client";

import {
  FormAssistantResponse,
  FormSettings,
  sendMessage as serverSendMessage,
  createFormSessionAction,
} from "@/actions/form-assistant";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect, useRef } from "react";
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
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [started, setStarted] = useState(false);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [allMessages, setAllMessages] = useState<ExtendedMessage[]>([]);

  const { messages, isLoading, error, clearError, handleSubmit } = useChat<FormAssistantResponse>({
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
  const [animateOut, setAnimateOut] = useState(false);
  const [prevAssistantMessage, setPrevAssistantMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

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
    if (latestAssistantMessage) {
      if (prevAssistantMessage !== latestAssistantMessage.content) {
        if (prevAssistantMessage) {
          setAnimateOut(true);
          const timer = setTimeout(() => {
            setPrevAssistantMessage(latestAssistantMessage.content);
            setAnimateOut(false);
          }, 250);
          return () => clearTimeout(timer);
        } else {
          setPrevAssistantMessage(latestAssistantMessage.content);
        }
      }
    }
  }, [latestAssistantMessage, prevAssistantMessage]);

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

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-auto">
        <div className="w-full max-w-lg space-y-6">
          {/* Form title and progress */}
          <div className="text-center space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {formSettings.title}
            </p>
            {started && !isFormCompleted && (
              <div className="mx-auto max-w-xs">
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

          {/* Assistant message */}
          {latestAssistantMessage && (
            <div
              className={`transition-all duration-250 ease-out ${
                animateOut ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-base leading-relaxed text-foreground">
                  {latestAssistantMessage.content}
                </p>
              </div>
            </div>
          )}

          {/* User interaction area */}
          <div className="animate-fade-in">
            {isLoading && userMessage ? (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                <p className="text-sm text-foreground">
                  {userMessage === "start_form" ? "Starting..." : userMessage}
                </p>
              </div>
            ) : !started ? (
              <div className="flex justify-center">
                <button
                  onClick={handleStartClick}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  {formSettings.callToAction}
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : isFormCompleted ? (
              <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
                <CheckCircle2 size={32} className="mx-auto mb-3 text-success" />
                <p className="text-foreground">
                  {formSettings.endScreenMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="relative">
                <input
                  ref={inputRef}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="Type your response..."
                  disabled={isLoading}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground disabled:opacity-30 transition-opacity"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-4 w-full max-w-lg animate-fade-in">
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <AlertCircle size={16} className="shrink-0 text-destructive" />
              <p className="flex-1 text-sm text-foreground">{error}</p>
              <button
                onClick={clearError}
                className="inline-flex items-center gap-1 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors border border-border"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading dots */}
        {isLoading && (
          <div className="mt-6 flex items-center gap-2 text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { FormResponse, sendMessage } from "@/actions/form-manager";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  User,
  Send,
  Sliders,
  ArrowRight,
  FileText,
  MessageCircle,
  BellRing,
  Building,
  Award,
  CornerDownRight,
  Clock,
  Users,
  Copy,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { Message } from "@ai-sdk/react";

// Extended message type to match the server-side type
interface ExtendedMessage extends Message {
  responseData?: FormResponse;
}

interface FormBuilderClientProps {
  formId: string;
  initialMessages?: Message[];
}

export default function FormBuilderClient({
  formId,
  initialMessages,
}: FormBuilderClientProps) {
  const { messages, isLoading, handleSubmit } = useChat<FormResponse>({
    sendMessage: async (formId, message) => {
      // Cast the result to ExtendedMessage[] to ensure TypeScript understands
      // that the messages returned by the server action might have responseData
      return (await sendMessage(formId, message)) as ExtendedMessage[];
    },
    formId,
    initialMessages: initialMessages || [
      {
        id: "initial-message",
        role: "assistant",
        content:
          "Let's start creating the form. Give me an idea of what is form created for?",
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [lastFormUpdateMessageId, setLastFormUpdateMessageId] = useState<
    string | null
  >(null);
  const [formSettings, setFormSettings] = useState<
    FormResponse["formSettings"] | null
  >(null);
  const [formSettingsUpdated, setFormSettingsUpdated] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract form settings from assistant messages
  useEffect(() => {
    if (messages.length > 0) {
      // Look for messages with form settings
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i] as ExtendedMessage;
        if (message.role === "assistant") {
          // First check if message has responseData directly (new format)
          if (message.responseData?.formSettings) {
            setFormSettings(message.responseData.formSettings);
            setFormSettingsUpdated(true);
            setLastFormUpdateMessageId(message.id);
            break;
          }

          // Fallback to parsing JSON from message content (backward compatibility)
          try {
            const match = message.content.match(/```json\n([\s\S]*?)\n```/);
            if (match && match[1]) {
              const data = JSON.parse(match[1]);
              if (data.formSettings) {
                setFormSettings(data.formSettings);
                setFormSettingsUpdated(true);
                setLastFormUpdateMessageId(message.id);
                break;
              }
            }
          } catch (error) {
            // Continue if parsing fails
            console.log("Error parsing form settings from message", error);
          }
        }
      }
    }
  }, [messages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-show preview when form settings are updated
  useEffect(() => {
    if (formSettingsUpdated) {
      setShowPreview(false); // Keep panel closed by default
    }
  }, [formSettingsUpdated]);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSubmit(e);
      setInputValue("");
    }
  };

  const handleShareClick = () => {
    setShowSharePopup(!showSharePopup);
  };

  const handleCopyLink = () => {
    const formLink = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(formLink);
    setCopied(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Header */}
        <div className="relative z-10">
          <div className="absolute top-0 left-0 w-full h-40 bg-purple-600/10 blur-[100px] rounded-full animate-pulse"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-60 left-20 w-60 h-60 bg-indigo-600/5 blur-[100px] rounded-full animate-pulse delay-300"></div>
          <div className="fixed bottom-0 right-0 w-80 h-80 bg-fuchsia-500/5 blur-[100px] rounded-full"></div>
        </div>

        <header className="p-6 backdrop-blur-md bg-black/30 border-b border-white/10 flex items-center z-10">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <MessageSquare size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Form Builder
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                onClick={handleShareClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white"
              >
                <LinkIcon size={14} />
                <span className="text-sm">Share</span>
              </button>

              {showSharePopup && (
                <div className="absolute right-0 mt-2 w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg shadow-purple-900/20 p-4 z-50 animate-fadeIn">
                  <h3 className="text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                    <LinkIcon size={14} className="text-purple-400" />
                    Form Link
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 truncate">
                      {`${window.location.origin}/form?id=${formId}`}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
                        copied
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    Share this link with others to let them fill your form
                  </p>
                </div>
              )}
            </div>

            {lastFormUpdateMessageId && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border 
                ${
                  showPreview
                    ? "bg-purple-500/20 text-white border-purple-500/30 hover:bg-purple-500/30"
                    : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FileText
                  size={14}
                  className={showPreview ? "text-purple-300" : ""}
                />
                <span className="text-sm">
                  {showPreview ? "Hide Details" : "View Form Settings"}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages?.map((m, index) => (
              <div
                key={`${m.id}-${index}`}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 animate-fadeIn
                    ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/10"
                        : "bg-white/5 backdrop-blur-sm border border-white/5"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center
                      ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User size={14} />
                      ) : (
                        <MessageCircle size={14} />
                      )}
                    </div>
                    <div className="font-medium text-sm text-white/80">
                      {m.role === "user" ? "You" : "Assistant"}
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-white/90">
                    {m.content}
                  </div>

                  {m.role === "assistant" &&
                    m.id === lastFormUpdateMessageId &&
                    formSettings && (
                      <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-white/5 to-purple-500/5 border border-white/10 backdrop-blur-sm animate-fadeIn relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-50"></div>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-purple-400 text-xs font-medium">
                              <Sliders size={14} className="animate-pulse" />
                              FORM SETTINGS UPDATED
                            </div>
                            <button
                              onClick={() => setShowPreview(true)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/5"
                            >
                              <span>Detailed View</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>

                          <div className="space-y-2 text-sm">
                            {/* Title & Tone Row */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                              <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
                                <FileText
                                  size={12}
                                  className="text-purple-400 mr-1.5 group-hover:text-purple-300 transition-colors"
                                />
                                <span className="text-white font-medium truncate text-xs">
                                  {formSettings.title}
                                </span>
                              </div>
                              <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
                                <MessageCircle
                                  size={12}
                                  className="text-blue-400 mr-1.5 group-hover:text-blue-300 transition-colors"
                                />
                                <span className="text-white/90 text-xs">
                                  {formSettings.tone}
                                </span>
                              </div>
                            </div>

                            {/* Persona & Target Audience Row */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                              <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
                                <User
                                  size={12}
                                  className="text-emerald-400 mr-1.5 group-hover:text-emerald-300 transition-colors"
                                />
                                <span className="text-white/90 text-xs truncate">
                                  {formSettings.persona}
                                </span>
                              </div>
                              <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
                                <Users
                                  size={12}
                                  className="text-amber-400 mr-1.5 group-hover:text-amber-300 transition-colors"
                                />
                                <span className="text-white/90 text-xs truncate">
                                  {formSettings.targetAudience}
                                </span>
                              </div>
                            </div>

                            {/* Journey Row */}
                            <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
                              <Award
                                size={12}
                                className="text-indigo-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-indigo-300 transition-colors"
                              />
                              <div className="flex flex-wrap gap-1.5 flex-1">
                                {formSettings.journey.map(
                                  (step: string, i: number) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-white/90 text-xs flex items-center"
                                    >
                                      {step}
                                      {i < formSettings.journey.length - 1 && (
                                        <CornerDownRight
                                          size={8}
                                          className="ml-1 text-indigo-400"
                                        />
                                      )}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {/* About Business Row */}
                              <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
                                <Building
                                  size={12}
                                  className="text-green-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-green-300 transition-colors"
                                />
                                <p className="text-white/90 text-xs flex-1 line-clamp-2">
                                  {formSettings.aboutBusiness}
                                </p>
                              </div>

                              {/* Welcome Message Row */}
                              <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
                                <BellRing
                                  size={12}
                                  className="text-cyan-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-cyan-300 transition-colors"
                                />
                                <p className="text-white/90 text-xs flex-1 line-clamp-2">
                                  {formSettings.welcomeMessage}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {/* Call to Action Row */}
                              <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
                                <Send
                                  size={12}
                                  className="text-yellow-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-yellow-300 transition-colors"
                                />
                                <p className="text-white/90 text-xs flex-1 line-clamp-1">
                                  {formSettings.callToAction}
                                </p>
                              </div>

                              {/* End Screen Message Row */}
                              <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
                                <MessageSquare
                                  size={12}
                                  className="text-red-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-red-300 transition-colors"
                                />
                                <p className="text-white/90 text-xs flex-1 line-clamp-1">
                                  {formSettings.endScreenMessage}
                                </p>
                              </div>
                            </div>

                            {/* Expected Completion Time */}
                            <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
                              <Clock
                                size={12}
                                className="text-pink-400 mr-1.5 group-hover:text-pink-300 transition-colors"
                              />
                              <span className="text-white/90 text-xs">
                                {formSettings.expectedCompletionTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 backdrop-blur-md bg-black/30 border-t border-white/10 z-10">
          <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative">
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/40 text-white"
                placeholder="Describe a form you need..."
                disabled={isLoading}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white disabled:opacity-50 transition-all hover:shadow-md hover:shadow-purple-500/20"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>

            {isLoading && (
              <div className="absolute -top-10 left-0 right-0 text-center text-white/60 flex items-center justify-center gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Form Settings Preview Panel */}
      {lastFormUpdateMessageId && formSettings && (
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-md backdrop-blur-xl border-l transition-all duration-300 ease-in-out z-20
            ${
              showPreview
                ? "translate-x-0 shadow-2xl shadow-purple-900/20 bg-black/60 border-purple-500/20"
                : "translate-x-full bg-black/40 border-white/10"
            }`}
        >
          <div className="h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 animate-slideIn">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sliders size={20} className="text-purple-400" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Form Settings Detail
                </span>
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 group"
              >
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Form Title */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "50ms" }}
              >
                <div className="flex items-center gap-2 text-purple-400 mb-2 text-sm font-medium">
                  <FileText size={16} />
                  TITLE
                </div>
                <h3 className="text-lg font-semibold">{formSettings.title}</h3>
              </div>

              {/* Tone */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex items-center gap-2 text-blue-400 mb-2 text-sm font-medium">
                  <MessageCircle size={16} />
                  TONE
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-white text-sm">
                    {formSettings.tone}
                  </span>
                </div>
              </div>

              {/* Persona */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "125ms" }}
              >
                <div className="flex items-center gap-2 text-emerald-400 mb-2 text-sm font-medium">
                  <User size={16} />
                  PERSONA
                </div>
                <p className="text-white/80">{formSettings.persona}</p>
              </div>

              {/* Target Audience */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "150ms" }}
              >
                <div className="flex items-center gap-2 text-amber-400 mb-2 text-sm font-medium">
                  <Users size={16} />
                  TARGET AUDIENCE
                </div>
                <p className="text-white/80">{formSettings.targetAudience}</p>
              </div>

              {/* Journey */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "175ms" }}
              >
                <div className="flex items-center gap-2 text-indigo-400 mb-2 text-sm font-medium">
                  <Award size={16} />
                  JOURNEY
                </div>
                <div className="flex flex-wrap gap-2">
                  {formSettings.journey.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-white text-sm flex items-center">
                        {step}
                        {i < formSettings.journey.length - 1 && (
                          <CornerDownRight
                            size={14}
                            className="ml-2 text-indigo-400"
                          />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* About Business */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "200ms" }}
              >
                <div className="flex items-center gap-2 text-green-400 mb-2 text-sm font-medium">
                  <Building size={16} />
                  ABOUT BUSINESS
                </div>
                <p className="text-white/80">{formSettings.aboutBusiness}</p>
              </div>

              {/* Welcome Message */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "250ms" }}
              >
                <div className="flex items-center gap-2 text-cyan-400 mb-2 text-sm font-medium">
                  <BellRing size={16} />
                  WELCOME MESSAGE
                </div>
                <p className="text-white/80">{formSettings.welcomeMessage}</p>
              </div>

              {/* Call To Action */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "300ms" }}
              >
                <div className="flex items-center gap-2 text-yellow-400 mb-2 text-sm font-medium">
                  <Send size={16} />
                  CALL TO ACTION
                </div>
                <p className="text-white/80">{formSettings.callToAction}</p>
              </div>

              {/* End Screen Message */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "350ms" }}
              >
                <div className="flex items-center gap-2 text-red-400 mb-2 text-sm font-medium">
                  <MessageCircle size={16} />
                  END SCREEN MESSAGE
                </div>
                <p className="text-white/80">{formSettings.endScreenMessage}</p>
              </div>

              {/* Expected Completion Time */}
              <div
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex items-center gap-2 text-pink-400 mb-2 text-sm font-medium">
                  <Clock size={16} />
                  EXPECTED COMPLETION TIME
                </div>
                <p className="text-white/80">
                  {formSettings.expectedCompletionTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

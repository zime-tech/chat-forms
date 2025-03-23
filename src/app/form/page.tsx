"use client";

import {
  FormAssistantResponse,
  FormSettings,
  sendMessage,
} from "@/actions/form-assistant";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  User,
  Send,
  MessageCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const sampleSettings: FormSettings = {
  title: "Chatoura User Feedback",
  tone: "friendly",
  persona: "Engaging Chatoura Support",
  journey: [
    "Welcome users and explain the purpose of the feedback",
    "Ask about their overall experience with Chatoura",
    "Inquire about specific features they liked or disliked",
    "Request suggestions for improvements",
  ],
  targetAudience: "Early users of the Chatoura platform",
  expectedCompletionTime: "5-10 minutes",
  aboutBusiness:
    "Chatoura is a chatbot creation platform that allows users to create AI chatbots and connect them to their websites or Facebook pages.",
  welcomeMessage:
    "Hi there! We appreciate your feedback on Chatoura. Your insights will help us improve our platform.",
  callToAction: "Start Form",
  endScreenMessage:
    "Thank you for taking the time to share your thoughts. Your feedback is invaluable to us.",
};

export default function FormChat() {
  const [started, setStarted] = useState(false);

  const { messages, isLoading, handleSubmit, responseData, addMessage } =
    useChat<FormAssistantResponse>({
      sendMessage: (messages) => sendMessage(messages, sampleSettings),
      extractResponseText: (data) => data.responseToUser,
      initialMessages: [
        {
          id: "initial-message",
          role: "assistant",
          content: sampleSettings.welcomeMessage,
        },
      ],
    });

  const [inputValue, setInputValue] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [animateOut, setAnimateOut] = useState(false);
  const [prevAssistantMessage, setPrevAssistantMessage] = useState<
    string | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the latest assistant message
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  // Check if form is completed from response data
  const isFormCompleted = responseData?.formCompleted === true;

  // Handle animations when messages change
  useEffect(() => {
    if (
      latestAssistantMessage &&
      latestAssistantMessage.content !== prevAssistantMessage
    ) {
      if (prevAssistantMessage) {
        // Trigger fade-out animation
        setAnimateOut(true);

        // After animation completes, update to new message
        const timer = setTimeout(() => {
          setPrevAssistantMessage(latestAssistantMessage.content);
          setAnimateOut(false);
        }, 300); // Match this to the animation duration

        return () => clearTimeout(timer);
      } else {
        // First message, no animation needed
        setPrevAssistantMessage(latestAssistantMessage.content);
      }
    }
  }, [latestAssistantMessage, prevAssistantMessage]);

  // Focus input after assistant responds
  useEffect(() => {
    if (!isLoading && inputRef.current && started) {
      inputRef.current.focus();
    }
  }, [isLoading, messages.length, started]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUserMessage(inputValue);
      // Don't animate out yet - wait for the new message to arrive
      handleSubmit(e);
    }
  };

  // Handle start button click
  const handleStartClick = () => {
    setStarted(true);
    // Use addMessage directly instead of going through the form submission
    setUserMessage("start_form");
    // Add the message and trigger the response flow
    addMessage("start_form", "user");
  };

  // Clear input after receiving response
  useEffect(() => {
    if (!isLoading && userMessage) {
      setInputValue("");
      setUserMessage("");
    }
  }, [isLoading]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-full h-40 bg-purple-600/10 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full animate-pulse delay-150"></div>
      <div className="absolute top-60 left-20 w-60 h-60 bg-indigo-600/5 blur-[100px] rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-fuchsia-500/5 blur-[100px] rounded-full"></div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes fadeOutUp {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          to {
            opacity: 0;
            transform: translate3d(0, -20px, 0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }

        .fade-out-up {
          animation: fadeOutUp 0.3s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 backdrop-blur-md bg-black/30 border-b border-white/10 flex items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Form Builder
          </h1>
        </div>
      </header>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Form Title */}
          <div className="text-center opacity-75 fade-in-up">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              {sampleSettings.title}
            </h2>
            <div className="mt-1 w-16 h-0.5 bg-gradient-to-r from-purple-500/40 to-blue-500/40 mx-auto rounded-full"></div>
          </div>

          {/* Assistant Message */}
          {latestAssistantMessage && (
            <div
              className={`transition-all duration-300 ease-in-out ${
                animateOut ? "fade-out-up" : "fade-in-up"
              }`}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div className="font-medium text-sm text-white/80">
                    Assistant
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-white/90 text-lg">
                  {prevAssistantMessage || latestAssistantMessage.content}
                </div>
              </div>
            </div>
          )}

          {/* User Input or Current Message */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              isLoading ? "" : "fade-in-up"
            }`}
          >
            {isLoading && userMessage ? (
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-6 fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div className="font-medium text-sm text-white/80">You</div>
                </div>
                <div className="whitespace-pre-wrap text-white/90 text-lg">
                  {userMessage === "start_form"
                    ? "Starting form..."
                    : userMessage}
                </div>
              </div>
            ) : !started ? (
              <div className="flex justify-center mt-6 fade-in-up">
                <button
                  onClick={handleStartClick}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium text-lg flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105 group"
                >
                  {sampleSettings.callToAction}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            ) : isFormCompleted ? (
              <div className="mt-6 fade-in-up">
                <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <p className="text-white/90 text-lg mb-4">
                    {sampleSettings.endScreenMessage}
                  </p>
                  <p className="text-white/70 text-sm">
                    Form completed: {sampleSettings.expectedCompletionTime}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="relative mt-6">
                <input
                  ref={inputRef}
                  className="w-full px-5 py-4 pr-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/40 text-white text-lg shadow-lg"
                  placeholder="Type your response..."
                  disabled={isLoading}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white disabled:opacity-50 transition-all hover:shadow-md hover:shadow-purple-500/20"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute bottom-8 left-0 right-0 text-center text-white/60 flex items-center justify-center gap-2 fade-in-up">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}

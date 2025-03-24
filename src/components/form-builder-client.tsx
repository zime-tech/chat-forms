"use client";

import { Message } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { MessageCircle, Settings } from "lucide-react";
import FormBuilderChat from "./builder/form-builder-chat";
import Header from "./builder/header";
import { useFormSettings } from "@/hooks/use-form-settings";
import FormSettingsPanel from "./settings/form-setting-panel";
import { FormSettings } from "./builder/types";
import { Toaster } from "sonner";
import FormAssistantClient from "./form-assistant-client";
import { createFormSession } from "@/db/storage";

interface FormBuilderProps {
  formId: string;
  initialMessages?: Message[];
}

export default function FormBuilder({
  formId,
  initialMessages,
}: FormBuilderProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: "initial-message",
        role: "assistant",
        content:
          "Let's start creating the form. Give me an idea of what is form created for?",
      },
    ]
  );
  const [formAssistantSessionId, setFormAssistantSessionId] = useState<
    string | null
  >(null);

  const resetSession = () => {
    createFormSession({ formId }).then((newSession) => {
      setFormAssistantSessionId(newSession.id);
    });
  };

  useEffect(() => {
    if (!formAssistantSessionId && formId) {
      resetSession();
    }
  }, [formAssistantSessionId, formId]);

  const {
    formSettings,
    lastFormUpdateMessageId,
    updateFormSettings,
    formSettingsUpdated,
    setFormSettingsUpdated,
  } = useFormSettings(messages, formId);

  useEffect(() => {
    if (formSettings && formId) {
      console.log("resetting session");
      console.log(formSettings);
      resetSession();
    }
  }, [formSettings, formId]);

  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = () => {
    const formLink = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(formLink);
    setCopied(true);
  };

  // Handler to update messages from the chat component
  const handleMessagesUpdate = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const onResetClick = () => {
    if (
      confirm(
        "Are you sure you want to reset the form session? This will clear all current progress."
      )
    ) {
      // clear the session
      setFormAssistantSessionId(null);

      // generate a new session id
      setTimeout(() => {
        resetSession();
      }, 10);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />

      {/* Header */}
      <Header
        formId={formId}
        showSharePopup={showSharePopup}
        setShowSharePopup={setShowSharePopup}
        handleCopyLink={handleCopyLink}
        copied={copied}
      />

      {/* Main Split Layout: 40-60 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - 40% - Existing Content */}
        <div className="w-[40%] flex flex-col border-r border-white/10 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 bg-gray-900 shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-white border-b-2 border-purple-500"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              <MessageCircle size={16} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "text-white border-b-2 border-purple-500"
                  : "text-white/60 hover:text-white/80"
              }`}
              disabled={!formSettings}
            >
              <Settings size={16} />
              Settings{!formSettings}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative h-full overflow-hidden">
            <div
              className={`absolute inset-0 ${
                activeTab === "chat" ? "z-10 visible" : "z-0 invisible"
              }`}
            >
              <FormBuilderChat
                formId={formId}
                initialMessages={initialMessages}
                formSettings={formSettings}
                lastFormUpdateMessageId={lastFormUpdateMessageId}
                formSettingsUpdated={formSettingsUpdated}
                setFormSettingsUpdated={setFormSettingsUpdated}
                onMessagesUpdate={handleMessagesUpdate}
                onDetailedView={() => setActiveTab("settings")}
              />
            </div>

            <div
              className={`absolute inset-0 ${
                activeTab === "settings" ? "z-10 visible" : "z-0 invisible"
              }`}
            >
              {formSettings ? (
                <FormSettingsPanel
                  formId={formId}
                  formSettings={formSettings}
                  onSettingsUpdate={(newSettings: FormSettings) =>
                    updateFormSettings(newSettings, "manual-update")
                  }
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white/70">
                  No form settings available yet. Use the chat to create a form
                  first.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - 60% - Currently Empty */}
        <div className="w-[60%] overflow-hidden relative">
          {formAssistantSessionId && formSettings && (
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={onResetClick}
                className="group flex items-center space-x-1 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white/90 px-3 py-1.5 rounded-full border border-white/10 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transform rotate-45 group-hover:rotate-[405deg] transition-transform duration-500"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                <span className="text-xs font-medium">Reset Session</span>
              </button>
            </div>
          )}
          {formAssistantSessionId && formSettings && (
            <FormAssistantClient
              sessionId={formAssistantSessionId}
              formId={formId}
              formSettings={formSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
}

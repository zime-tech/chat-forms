"use client";

import { Message } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { MessageCircle, Settings } from "lucide-react";
import FormBuilderChat from "./builder/form-builder-chat";
import Header from "./builder/header";
import { useFormSettings } from "@/hooks/use-form-settings";
import FormSettingsPanel from "./settings/FormSettingsPanel";
import { FormSettings } from "./builder/types";
import { Toaster } from "sonner";

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

  const {
    formSettings,
    lastFormUpdateMessageId,
    updateFormSettings,
    formSettingsUpdated,
    setFormSettingsUpdated,
  } = useFormSettings(messages, formId);

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

  return (
    <div className="flex flex-col h-screen">
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

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 bg-gray-900">
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
          Settings{!formSettings && " (Coming soon)"}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
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
  );
}

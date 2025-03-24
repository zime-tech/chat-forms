"use client";

import { FormResponse, sendMessage } from "@/actions/form-builder";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect } from "react";
import { Message } from "@ai-sdk/react";
import { ExtendedMessage, FormSettings } from "./types";
import Header from "./header";
import MessageList from "./message-list";
import InputForm from "./input-form";
import FormSettingsDetail from "./form-settings-detail";
import BackgroundEffects from "./background-effects";

interface FormBuilderClientProps {
  formId: string;
  initialMessages?: Message[];
  formSettings?: FormSettings | null;
  lastFormUpdateMessageId?: string | null;
  formSettingsUpdated?: boolean;
  setFormSettingsUpdated?: (updated: boolean) => void;
  onMessagesUpdate?: (messages: Message[]) => void;
  onDetailedView?: () => void;
}

export default function FormBuilderChat({
  formId,
  initialMessages,
  formSettings: externalFormSettings,
  lastFormUpdateMessageId: externalLastFormUpdateMessageId,
  formSettingsUpdated: externalFormSettingsUpdated,
  setFormSettingsUpdated: externalSetFormSettingsUpdated,
  onMessagesUpdate,
  onDetailedView = () => {},
}: FormBuilderClientProps) {
  const { messages, isLoading, handleSubmit } = useChat<FormResponse>({
    sendMessage: async (formId, message) => {
      // Cast the result to ExtendedMessage[] to ensure TypeScript understands
      // that the messages returned by the server action might have responseData
      const newMessages = (await sendMessage(
        formId,
        message
      )) as ExtendedMessage[];

      // Pass messages update to parent component if provided
      if (onMessagesUpdate) {
        onMessagesUpdate(newMessages);
      }

      return newMessages;
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

  const [showPreview, setShowPreview] = useState(false);

  // Use internal state only if external state is not provided
  const [internalFormSettings, setInternalFormSettings] =
    useState<FormSettings | null>(null);
  const [internalLastFormUpdateMessageId, setInternalLastFormUpdateMessageId] =
    useState<string | null>(null);
  const [internalFormSettingsUpdated, setInternalFormSettingsUpdated] =
    useState(false);

  // Use either external state (if provided) or internal state
  const formSettings =
    externalFormSettings !== undefined
      ? externalFormSettings
      : internalFormSettings;
  const lastFormUpdateMessageId =
    externalLastFormUpdateMessageId !== undefined
      ? externalLastFormUpdateMessageId
      : internalLastFormUpdateMessageId;
  const formSettingsUpdated =
    externalFormSettingsUpdated !== undefined
      ? externalFormSettingsUpdated
      : internalFormSettingsUpdated;
  const setFormSettingsUpdated =
    externalSetFormSettingsUpdated || setInternalFormSettingsUpdated;

  // Extract form settings from assistant messages only if external state is not provided
  useEffect(() => {
    if (externalFormSettings === undefined && messages.length > 0) {
      // Look for messages with form settings
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i] as ExtendedMessage;
        if (message.role === "assistant") {
          // First check if message has responseData directly (new format)
          if (message.responseData?.formSettings) {
            setInternalFormSettings(message.responseData.formSettings);
            setInternalFormSettingsUpdated(true);
            setInternalLastFormUpdateMessageId(message.id);
            break;
          }

          // Fallback to parsing JSON from message content (backward compatibility)
          try {
            const match = message.content.match(/```json\n([\s\S]*?)\n```/);
            if (match && match[1]) {
              const data = JSON.parse(match[1]);
              if (data.formSettings) {
                setInternalFormSettings(data.formSettings);
                setInternalFormSettingsUpdated(true);
                setInternalLastFormUpdateMessageId(message.id);
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
  }, [messages, externalFormSettings]);

  // Auto-show preview when form settings are updated
  useEffect(() => {
    if (formSettingsUpdated) {
      setShowPreview(false); // Keep panel closed by default
    }
  }, [formSettingsUpdated]);

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Background Effects */}
        <BackgroundEffects />

        {/* Messages Container */}
        <MessageList
          messages={messages as ExtendedMessage[]}
          lastFormUpdateMessageId={lastFormUpdateMessageId}
          formSettings={formSettings}
          onDetailedView={onDetailedView}
        />

        {/* Input Form */}
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Form Settings Detail Panel */}
      {lastFormUpdateMessageId && formSettings && (
        <FormSettingsDetail
          formSettings={formSettings}
          setShowPreview={setShowPreview}
          showPreview={showPreview}
        />
      )}
    </div>
  );
}

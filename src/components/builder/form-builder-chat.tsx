"use client";

import { FormResponse, sendMessage } from "@/actions/form-builder";
import { useChat } from "@/hooks/use-chat";
import { useState, useEffect } from "react";
import { Message } from "@ai-sdk/react";
import { ExtendedMessage, FormSettings } from "./types";
import MessageList from "./message-list";
import InputForm from "./input-form";
import { INITIAL_BUILDER_MESSAGE } from "@/lib/constants";

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
  const { messages, isLoading, error, clearError, handleSubmit } = useChat<FormResponse>({
    sendMessage: async (formId, message) => {
      const newMessages = (await sendMessage(formId, message)) as ExtendedMessage[];
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
        content: INITIAL_BUILDER_MESSAGE,
      },
    ],
  });

  const [internalFormSettings, setInternalFormSettings] = useState<FormSettings | null>(null);
  const [internalLastFormUpdateMessageId, setInternalLastFormUpdateMessageId] = useState<string | null>(null);
  const [internalFormSettingsUpdated, setInternalFormSettingsUpdated] = useState(false);

  const formSettings = externalFormSettings !== undefined ? externalFormSettings : internalFormSettings;
  const lastFormUpdateMessageId = externalLastFormUpdateMessageId !== undefined ? externalLastFormUpdateMessageId : internalLastFormUpdateMessageId;

  useEffect(() => {
    if (externalFormSettings === undefined && messages.length > 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i] as ExtendedMessage;
        if (message.role === "assistant" && message.responseData?.formSettings) {
          setInternalFormSettings(message.responseData.formSettings);
          setInternalFormSettingsUpdated(true);
          setInternalLastFormUpdateMessageId(message.id);
          break;
        }
      }
    }
  }, [messages, externalFormSettings]);

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      <MessageList
        messages={messages as ExtendedMessage[]}
        lastFormUpdateMessageId={lastFormUpdateMessageId}
        formSettings={formSettings}
        onDetailedView={onDetailedView}
        isLoading={isLoading}
      />
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-foreground">
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="shrink-0 rounded px-2 py-0.5 text-xs font-medium hover:bg-surface-hover transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

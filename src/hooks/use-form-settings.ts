import { useState, useEffect } from "react";
import { FormSettings } from "@/components/builder/types";
import { Message } from "@ai-sdk/react";
import { ExtendedMessage } from "@/components/builder/types";
import { getForm, updateForm } from "@/db/storage";

interface UseFormSettingsResult {
  formSettings: FormSettings | null;
  lastFormUpdateMessageId: string | null;
  updateFormSettings: (settings: FormSettings, messageId: string) => void;
  formSettingsUpdated: boolean;
  setFormSettingsUpdated: (updated: boolean) => void;
}

export function useFormSettings(
  messages: Message[],
  formId: string
): UseFormSettingsResult {
  const [formSettings, setFormSettings] = useState<FormSettings | null>(null);
  const [lastFormUpdateMessageId, setLastFormUpdateMessageId] = useState<
    string | null
  >(null);
  const [formSettingsUpdated, setFormSettingsUpdated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const fetchFormSettings = async () => {
        const formSettings = await getForm(formId);
        setFormSettings(formSettings as FormSettings);
        setInitialized(true);
      };
      fetchFormSettings();
    }
  }, [initialized]);

  // Extract form settings from assistant messages
  useEffect(() => {
    if (messages.length > 0) {
      // Look for messages with form settings
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i] as ExtendedMessage;
        if (message.role === "assistant") {
          // First check if message has responseData directly (new format)
          if (message.responseData?.formSettings) {
            if (initialized) {
              setFormSettings(message.responseData.formSettings);
            }
            setFormSettingsUpdated(true);
            setLastFormUpdateMessageId(message.id);
            break;
          }
        }
      }
    }
  }, [messages]);

  // Function to manually update form settings
  const updateFormSettings = async (
    settings: FormSettings,
    messageId: string
  ) => {
    if (messageId === "manual-update") {
      console.log("Updating form settings", messageId);
      await updateForm(formId, settings);
    } else {
      setLastFormUpdateMessageId(messageId);
    }
    setFormSettings(settings);
    setFormSettingsUpdated(true);
  };

  return {
    formSettings,
    lastFormUpdateMessageId,
    updateFormSettings,
    formSettingsUpdated,
    setFormSettingsUpdated,
  };
}

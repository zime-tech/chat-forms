import { useState, useEffect } from "react";
import { FormSettings } from "@/components/builder/types";
import { Message } from "@ai-sdk/react";
import { ExtendedMessage } from "@/components/builder/types";
import { getForm } from "@/db/storage";
import { updateFormSettingsAction } from "@/actions/form-management";

interface UseFormSettingsResult {
  formSettings: FormSettings | null;
  lastFormUpdateMessageId: string | null;
  updateFormSettings: (settings: FormSettings, messageId: string) => void;
  formSettingsUpdated: boolean;
  setFormSettingsUpdated: (updated: boolean) => void;
}

export function useFormSettings(
  messages: Message[],
  formId: string,
  initialSettings?: FormSettings | null
): UseFormSettingsResult {
  const [formSettings, setFormSettings] = useState<FormSettings | null>(
    initialSettings ?? null
  );
  const [lastFormUpdateMessageId, setLastFormUpdateMessageId] = useState<
    string | null
  >(null);
  const [formSettingsUpdated, setFormSettingsUpdated] = useState(false);
  // When initialSettings is explicitly passed (even as null), skip the client-side fetch.
  // Using !== undefined rather than !! so that null (server says "no settings") also
  // counts as initialized and avoids a redundant getForm() round-trip.
  const [initialized, setInitialized] = useState(initialSettings !== undefined);

  useEffect(() => {
    if (!initialized) {
      const fetchFormSettings = async () => {
        const fs = await getForm(formId);
        if (!fs) {
          setInitialized(true);
          return;
        }
        setFormSettings({
          title: fs.title,
          tone: fs.tone ?? "",
          persona: fs.persona ?? "",
          keyInformation: fs.keyInformation ?? [],
          targetAudience: fs.targetAudience ?? "",
          expectedCompletionTime: fs.expectedCompletionTime ?? "",
          aboutBusiness: fs.aboutBusiness ?? "",
          welcomeMessage: fs.welcomeMessage ?? "",
          callToAction: fs.callToAction ?? "",
          endScreenMessage: fs.endScreenMessage ?? "",
          status: fs.status,
          closedAt: fs.closedAt,
          maxResponses: fs.maxResponses,
          webhookUrl: fs.webhookUrl,
          accentColor: fs.accentColor,
          emailNotifications: fs.emailNotifications,
        });
        setInitialized(true);
      };
      fetchFormSettings();
    }
  }, [formId, initialized]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, initialized]);

  // Function to manually update form settings
  const updateFormSettings = async (
    settings: FormSettings,
    messageId: string
  ) => {
    if (messageId === "manual-update") {
      await updateFormSettingsAction(formId, settings);
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

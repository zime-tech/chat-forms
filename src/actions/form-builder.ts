"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { z } from "zod";
import { formResponseSchema } from "@/types/promp-schema";
import { formBuilderSystemPrompt } from "@/system-prompts/builder";
import { addFormMessages, getFormMessages, updateForm } from "@/db/storage";
import { ExtendedMessage } from "@/db/schema";
import { trackEvent } from "@/lib/jitsu-server";
import { withAIErrorHandling } from "@/lib/ai-utils";
import { getSession } from "auth";

// Type for the form response
export type FormResponse = z.infer<typeof formResponseSchema>;

const trackFormBuilderEvent = async (
  formId: string,
  formSettingsUpdated: boolean
) => {
  await trackEvent("builder-message", {
    formId,
    formSettingsUpdated,
  });
};

export async function sendMessage(formId: string, message: Message) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  const messages = await getFormMessages(formId, userId);
  const newMessages: ExtendedMessage[] = [...messages, message];
  await addFormMessages(formId, newMessages, userId);

  const result = await withAIErrorHandling((signal) =>
    generateObject({
      model: openai("gpt-4o-mini"),
      schemaName: "form-settings-response",
      schemaDescription:
        "Schema for form settings including fields configuration",
      schema: formResponseSchema,
      messages: newMessages,
      system: formBuilderSystemPrompt,
      abortSignal: signal,
    })
  );

  const messageId = `msg-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  await Promise.all([
    addFormMessages(formId, [
      {
        id: messageId,
        content: result.object.responseToUser,
        role: "assistant",
        responseData: result.object as FormResponse,
      },
    ], userId),
    updateForm(formId, result.object.formSettings, userId),
    trackFormBuilderEvent(formId, result.object.formSettingsUpdated),
  ]);

  newMessages.push({
    id: messageId,
    content: result.object.responseToUser,
    responseData: result.object as FormResponse,
    role: "assistant",
  });

  return newMessages;
}

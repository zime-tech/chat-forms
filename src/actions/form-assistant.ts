"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { z } from "zod";
import {
  formAssistantResponseSchema,
  formSettingsSchema,
} from "@/types/promp-schema";
import { formAssistantSystemPrompt } from "@/system-prompts/assistant";
import {
  addFormSessionMessages,
  getForm,
  getFormSessionMessages,
} from "@/db/storage";
import { ExtendedMessage } from "@/db/schema";
import { google } from "@ai-sdk/google";

// Type for the form response
export type FormAssistantResponse = z.infer<typeof formAssistantResponseSchema>;
export type FormSettings = z.infer<typeof formSettingsSchema>;

const formatMessageContent = (
  message: Message,
  settings: FormSettings
): string => {
  if (message.role === "user") {
    return `
    User Message: ${message.content}
    Form Settings: ${JSON.stringify(settings)}
    `;
  }

  return message.content;
};

export async function sendMessage(
  formId: string,
  sessionId: string,
  message: Message
) {
  const messages = await getFormSessionMessages(sessionId);
  const newMessages: ExtendedMessage[] = [...messages, message];

  await addFormSessionMessages(sessionId, [message]);

  const formSettings = await getForm(formId);

  const result = await generateObject({
    model: google("gemini-2.0-flash-001"),
    schemaName: "form-assistant-response",
    schemaDescription: "Schema for form assistant response",
    schema: formAssistantResponseSchema,
    messages: newMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: formatMessageContent(
        msg,
        formSettings as unknown as FormSettings
      ),
    })),
    system: formAssistantSystemPrompt,
  });

  const messageId = `msg-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  const assistantMessage: ExtendedMessage = {
    id: messageId,
    content: result.object.responseToUser,
    role: "assistant",
    responseData: result.object as FormAssistantResponse,
  };

  await addFormSessionMessages(sessionId, [assistantMessage]);

  newMessages.push(assistantMessage);

  return newMessages;
}

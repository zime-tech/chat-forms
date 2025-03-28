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
  addFormSessionSummary,
  getForm,
  getFormSessionMessages,
} from "@/db/storage";
import { ExtendedMessage } from "@/db/schema";

// Type for the form response
export type FormAssistantResponse = z.infer<typeof formAssistantResponseSchema>;
export type FormSettings = z.infer<typeof formSettingsSchema>;

const formatMessageContent = (
  message: Message,
  settings: FormSettings,
  isLastMessage: boolean
): string => {
  if (message.role === "user") {
    const content = `
    User Message: ${message.content}
    `;
    if (isLastMessage) {
      return `
      ${content}
      Form Settings: ${JSON.stringify(settings)}
      `;
    } else {
      return content;
    }
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

  const form = await getForm(formId);
  const formSettings: FormSettings = {
    title: form.title,
    tone: form.tone || "",
    persona: form.persona || "",
    keyInformation: form.keyInformation || [],
    targetAudience: form.targetAudience || "",
    expectedCompletionTime: form.expectedCompletionTime || "",
    aboutBusiness: form.aboutBusiness || "",
    welcomeMessage: form.welcomeMessage || "",
    callToAction: form.callToAction || "",
    endScreenMessage: form.endScreenMessage || "",
  };

  const formattedMessages = newMessages.map((msg, index) => ({
    id: msg.id,
    role: msg.role,
    content: formatMessageContent(
      msg,
      formSettings as unknown as FormSettings,
      index === newMessages.length - 1
    ),
  }));

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schemaName: "form-assistant-response",
    schemaDescription: "Schema for form assistant response",
    schema: formAssistantResponseSchema,
    messages: formattedMessages,
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

  newMessages.push(assistantMessage);

  // save the summary
  let saveSummary = false;
  if (result.object.formCompleted && result.object.summary) {
    saveSummary = true;
  }

  await Promise.all([
    addFormSessionMessages(sessionId, [assistantMessage]),
    saveSummary && addFormSessionSummary(sessionId, result.object.summary),
  ]);

  return newMessages;
}

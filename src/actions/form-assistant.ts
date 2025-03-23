"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { z } from "zod";
import {
  formAssistantResponseSchema,
  formSettingsSchema,
} from "@/types/promp-schema";
import { formAssistantSystemPrompt } from "@/system-prompts/assistant";

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
  messages: Message[],
  formSettings: FormSettings
) {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schemaName: "form-assistant-response",
    schemaDescription: "Schema for form assistant response",
    schema: formAssistantResponseSchema,
    messages: messages.map((message) => ({
      ...message,
      content: formatMessageContent(message, formSettings),
    })),
    system: formAssistantSystemPrompt,
  });

  return result.object;
}

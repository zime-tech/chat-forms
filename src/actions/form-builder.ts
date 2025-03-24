"use server";

import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { generateObject, Message } from "ai";
import { z } from "zod";
import { formResponseSchema } from "@/types/promp-schema";
import { formBuilderSystemPrompt } from "@/system-prompts/builder";
import { addFormMessages, getFormMessages, updateForm } from "@/db/storage";
import { ExtendedMessage } from "@/db/schema";

// Type for the form response
export type FormResponse = z.infer<typeof formResponseSchema>;

export async function sendMessage(formId: string, message: Message) {
  const messages = await getFormMessages(formId);
  const newMessages: ExtendedMessage[] = [...messages, message];
  await addFormMessages(formId, newMessages);

  const result = await generateObject({
    model: google("gemini-2.0-flash-001"),
    schemaName: "form-settings-response",
    schemaDescription:
      "Schema for form settings including fields configuration",
    schema: formResponseSchema,
    messages: newMessages,
    system: formBuilderSystemPrompt,
  });

  const messageId = `msg-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  await addFormMessages(formId, [
    {
      id: messageId,
      content: result.object.responseToUser,
      role: "assistant",
      responseData: result.object as FormResponse,
    },
  ]);

  updateForm(formId, result.object.formSettings);

  newMessages.push({
    id: messageId,
    content: result.object.responseToUser,
    responseData: result.object as FormResponse,
    role: "assistant",
  });

  return newMessages;
}

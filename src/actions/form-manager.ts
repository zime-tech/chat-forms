"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { z } from "zod";
import { formResponseSchema } from "@/types/promp-schema";
import { formBuilderSystemPrompt } from "@/system-prompts/builder";

// Type for the form response
export type FormResponse = z.infer<typeof formResponseSchema>;

export async function sendMessage(messages: Message[]) {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schemaName: "form-settings-response",
    schemaDescription:
      "Schema for form settings including fields configuration",
    schema: formResponseSchema,
    messages,
    system: formBuilderSystemPrompt,
  });

  return result.object;
}

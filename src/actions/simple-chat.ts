"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { z } from "zod";

// A simpler response schema for demonstration
export const simpleChatSchema = z.object({
  message: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  topics: z.array(z.string()),
  timestamp: z.string(),
});

export type SimpleChatResponse = z.infer<typeof simpleChatSchema>;

export async function sendSimpleMessage(messages: Message[]) {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schemaName: "simple-chat",
    schemaDescription: "A simple chat response with sentiment analysis",
    schema: simpleChatSchema,
    messages,
  });

  // Add current timestamp
  const response = {
    ...result.object,
    timestamp: new Date().toISOString(),
  };

  return response;
}

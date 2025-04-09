"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { db } from "@/db/db";
import { formSessions } from "@/db/schema";
import { and, desc, eq, isNotNull, ne } from "drizzle-orm";
import { getFormMessages } from "@/db/storage";
import { formOverallSummarySchema } from "@/types/promp-schema";
import { getFormSummaryPrompt } from "@/system-prompts/results";

// Define types for our response that will be used on the client
export type FormSessionBasic = {
  id: string;
  formId: string | null;
  quickSummary: string | null;
  detailedSummary: string | null;
  overallSentiment: string | null;
  createdAt: Date | null;
};

export type FormSessionDetail = FormSessionBasic;

/**
 * Gets all form sessions for a specific form ID
 */
export async function getFormSessions(
  formId: string
): Promise<FormSessionBasic[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const sessions = await db
      .select({
        id: formSessions.id,
        formId: formSessions.formId,
        quickSummary: formSessions.quickSummary,
        detailedSummary: formSessions.detailedSummary,
        overallSentiment: formSessions.overallSentiment,
        createdAt: formSessions.createdAt,
      })
      .from(formSessions)
      .where(
        and(
          eq(formSessions.formId, formId),
          isNotNull(formSessions.quickSummary)
        )
      )
      .orderBy(desc(formSessions.createdAt));

    return sessions;
  } catch (error) {
    console.error("Error fetching form sessions:", error);
    throw new Error("Failed to fetch form sessions");
  }
}

/**
 * Gets the details of a specific form session
 */
export async function getFormSessionDetails(
  sessionId: string
): Promise<FormSessionDetail | null> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const [session] = await db
      .select({
        id: formSessions.id,
        formId: formSessions.formId,
        quickSummary: formSessions.quickSummary,
        detailedSummary: formSessions.detailedSummary,
        overallSentiment: formSessions.overallSentiment,
        createdAt: formSessions.createdAt,
      })
      .from(formSessions)
      .where(eq(formSessions.id, sessionId));

    return session || null;
  } catch (error) {
    console.error("Error fetching form session details:", error);
    throw new Error("Failed to fetch form session details");
  }
}

/**
 * Get overall summary of all form sessions
 */
export async function getOverallSummary(formId: string) {
  const sessions = await getFormSessions(formId);
  const messages = await getFormMessages(formId);

  const prompt = getFormSummaryPrompt(sessions, messages);

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: prompt,
      },
    ],
    schema: formOverallSummarySchema,
  });

  return result.object;
}

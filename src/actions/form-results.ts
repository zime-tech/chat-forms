"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, Message } from "ai";
import { db } from "@/db/db";
import { formSessions, StructuredAnswer } from "@/db/schema";
import { and, avg, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { getFormMessages } from "@/db/storage";
import { formOverallSummarySchema } from "@/types/promp-schema";
import { getFormSummaryPrompt } from "@/system-prompts/results";
import { withAIErrorHandling } from "@/lib/ai-utils";

// Define types for our response that will be used on the client
export type FormSessionBasic = {
  id: string;
  formId: string | null;
  quickSummary: string | null;
  detailedSummary: string | null;
  overallSentiment: string | null;
  createdAt: Date | null;
  flagged: boolean | null;
  reviewed: boolean | null;
};

export type FormSessionDetail = FormSessionBasic & {
  structuredData: StructuredAnswer[] | null;
};

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
        flagged: formSessions.flagged,
        reviewed: formSessions.reviewed,
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
        structuredData: formSessions.structuredData,
        createdAt: formSessions.createdAt,
        flagged: formSessions.flagged,
        reviewed: formSessions.reviewed,
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
 * Gets all form sessions for CSV export (includes all fields)
 */
export async function getFormSessionsForExport(
  formId: string
): Promise<FormSessionDetail[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const sessions = await db
    .select({
      id: formSessions.id,
      formId: formSessions.formId,
      quickSummary: formSessions.quickSummary,
      detailedSummary: formSessions.detailedSummary,
      overallSentiment: formSessions.overallSentiment,
      structuredData: formSessions.structuredData,
      createdAt: formSessions.createdAt,
      flagged: formSessions.flagged,
      reviewed: formSessions.reviewed,
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
}

export type FormAnalytics = {
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  avgCompletionSeconds: number | null;
  sentimentBreakdown: { sentiment: string; count: number }[];
};

/**
 * Gets analytics for a form: started, completed, completion rate, avg time
 */
export async function getFormAnalytics(formId: string): Promise<FormAnalytics> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const [totals] = await db
    .select({
      totalStarted: count(),
      totalCompleted: count(formSessions.completedAt),
      avgSeconds: sql<number | null>`
        AVG(EXTRACT(EPOCH FROM (${formSessions.completedAt} - ${formSessions.createdAt})))
      `.as("avg_seconds"),
    })
    .from(formSessions)
    .where(eq(formSessions.formId, formId));

  const sentimentRows: { sentiment: string | null; count: number }[] = await db
    .select({
      sentiment: formSessions.overallSentiment,
      count: count(),
    })
    .from(formSessions)
    .where(
      and(
        eq(formSessions.formId, formId),
        isNotNull(formSessions.overallSentiment)
      )
    )
    .groupBy(formSessions.overallSentiment);

  const totalStarted = totals?.totalStarted ?? 0;
  const totalCompleted = totals?.totalCompleted ?? 0;

  return {
    totalStarted,
    totalCompleted,
    completionRate: totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0,
    avgCompletionSeconds: totals?.avgSeconds ? Math.round(totals.avgSeconds) : null,
    sentimentBreakdown: sentimentRows
      .filter((r) => r.sentiment !== null)
      .map((r) => ({ sentiment: r.sentiment!, count: r.count })),
  };
}

/**
 * Get overall summary of all form sessions
 */
export async function getOverallSummary(formId: string) {
  const sessions = await getFormSessions(formId);
  const messages = await getFormMessages(formId);

  const prompt = getFormSummaryPrompt(sessions, messages);

  const result = await withAIErrorHandling((signal) =>
    generateObject({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      schema: formOverallSummarySchema,
      abortSignal: signal,
    })
  );

  return result.object;
}

/**
 * Toggle flagged status on a session
 */
export async function toggleSessionFlagged(sessionId: string, flagged: boolean) {
  if (!db) throw new Error("Database not initialized");
  await db
    .update(formSessions)
    .set({ flagged })
    .where(eq(formSessions.id, sessionId));
}

/**
 * Toggle reviewed status on a session
 */
export async function toggleSessionReviewed(sessionId: string, reviewed: boolean) {
  if (!db) throw new Error("Database not initialized");
  await db
    .update(formSessions)
    .set({ reviewed })
    .where(eq(formSessions.id, sessionId));
}

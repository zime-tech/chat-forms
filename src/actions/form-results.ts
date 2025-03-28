"use server";

import { db } from "@/db/db";
import { formSessions } from "@/db/schema";
import { and, desc, eq, isNotNull, ne } from "drizzle-orm";

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

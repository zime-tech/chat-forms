"use server";
import {
  ExtendedMessage,
  FormSessionsInsert,
  FormSettings,
  FormSettingsInsert,
  formCreationLogs,
  formSessions,
  forms,
  users,
} from "@/db/schema";
import { db } from "@/db/db";
import { and, count, desc, eq, gte, lte, max } from "drizzle-orm";
import { FormAssistantResponse } from "@/actions/form-assistant";
import { MAX_BUILDER_MESSAGES_STORED, MAX_FORMS_PER_USER } from "@/lib/constants";

export const createForm = async (newForm: FormSettingsInsert) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  if (!newForm.userId) {
    throw new Error("User ID is required");
  }

  // validate that the user didn't exceed the max number of forms today
  // check from the formCreationLogs table
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );

  const logs = await db
    .select()
    .from(formCreationLogs)
    .where(
      and(
        eq(formCreationLogs.userId, newForm.userId),
        and(
          gte(formCreationLogs.createdAt, startOfDay),
          lte(formCreationLogs.createdAt, endOfDay)
        )
      )
    );

  if (logs.length >= MAX_FORMS_PER_USER) {
    throw new Error("You have reached the maximum number of forms");
  }
  const form = await db.insert(forms).values(newForm).returning();

  await db.insert(formCreationLogs).values({
    userId: newForm.userId,
    formId: form[0].id,
  });

  return form;
};

export const getForm = async (id: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const form = await db.select().from(forms).where(eq(forms.id, id));
  return form[0];
};

/** Lightweight read — only the fields needed for the status-toggle action. */
export const getFormStatusFields = async (id: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const [form] = await db
    .select({ status: forms.status, closedAt: forms.closedAt, userId: forms.userId })
    .from(forms)
    .where(eq(forms.id, id));
  return form;
};

export const getUserForms = async (userId: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const allForms = await db
    .select({
      id: forms.id,
      title: forms.title,
      tone: forms.tone,
      persona: forms.persona,
      keyInformation: forms.keyInformation,
      targetAudience: forms.targetAudience,
      expectedCompletionTime: forms.expectedCompletionTime,
      aboutBusiness: forms.aboutBusiness,
      welcomeMessage: forms.welcomeMessage,
      callToAction: forms.callToAction,
      endScreenMessage: forms.endScreenMessage,
      status: forms.status,
      closedAt: forms.closedAt,
      maxResponses: forms.maxResponses,
      webhookUrl: forms.webhookUrl,
      accentColor: forms.accentColor,
      emailNotifications: forms.emailNotifications,
      createdAt: forms.createdAt,
      userId: forms.userId,
      responseCount: count(formSessions.completedAt),
      lastResponseAt: max(formSessions.completedAt),
    })
    .from(forms)
    .leftJoin(formSessions, eq(forms.id, formSessions.formId))
    .where(eq(forms.userId, userId))
    .groupBy(forms.id)
    .orderBy(desc(forms.createdAt));
  return allForms;
};

export const deleteForm = async (id: string, userId: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  // Verify ownership
  const [form] = await db
    .select({ id: forms.id })
    .from(forms)
    .where(and(eq(forms.id, id), eq(forms.userId, userId)));

  if (!form) {
    throw new Error("Form not found");
  }

  // Delete sessions first (FK constraint)
  await db.delete(formSessions).where(eq(formSessions.formId, id));
  // Delete form
  await db.delete(forms).where(eq(forms.id, id));
};

export const duplicateForm = async (id: string, userId: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const [original] = await db
    .select()
    .from(forms)
    .where(and(eq(forms.id, id), eq(forms.userId, userId)));

  if (!original) {
    throw new Error("Form not found");
  }

  const [duplicate] = await db
    .insert(forms)
    .values({
      title: `Copy of ${original.title}`,
      tone: original.tone,
      persona: original.persona,
      keyInformation: original.keyInformation,
      targetAudience: original.targetAudience,
      expectedCompletionTime: original.expectedCompletionTime,
      aboutBusiness: original.aboutBusiness,
      welcomeMessage: original.welcomeMessage,
      callToAction: original.callToAction,
      endScreenMessage: original.endScreenMessage,
      accentColor: original.accentColor,
      maxResponses: original.maxResponses,
      webhookUrl: original.webhookUrl,
      emailNotifications: original.emailNotifications,
      userId,
    })
    .returning();

  return duplicate;
};

export const getFormResponseCount = async (formId: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const [result] = await db
    .select({ count: count(formSessions.completedAt) })
    .from(formSessions)
    .where(eq(formSessions.formId, formId));

  return result?.count ?? 0;
};

export type FormClosedReason = "closed" | "scheduled" | "max_responses";

export const isFormAcceptingResponses = async (
  formId: string,
  preloadedForm?: Awaited<ReturnType<typeof getForm>>
): Promise<{ accepting: boolean; reason?: FormClosedReason }> => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const form = preloadedForm ?? await getForm(formId);
  if (!form) return { accepting: false, reason: "closed" };

  if (form.status === "closed") return { accepting: false, reason: "closed" };

  if (form.closedAt && new Date(form.closedAt) <= new Date()) {
    return { accepting: false, reason: "scheduled" };
  }

  if (form.maxResponses) {
    const responseCount = await getFormResponseCount(formId);
    if (responseCount >= form.maxResponses) {
      return { accepting: false, reason: "max_responses" };
    }
  }

  return { accepting: true };
};

export const updateForm = async (
  id: string,
  updatedForm: Partial<FormSettingsInsert>,
  userId?: string
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  // When userId is provided, verify ownership before updating
  if (userId) {
    const [existing] = await db
      .select({ userId: forms.userId })
      .from(forms)
      .where(eq(forms.id, id));
    if (!existing || existing.userId !== userId) {
      throw new Error("Unauthorized: you do not own this form");
    }
  }

  const form = await db
    .update(forms)
    .set(updatedForm)
    .where(eq(forms.id, id))
    .returning();
  return form;
};

export const getFormMessages = async (id: string, userId?: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const [form] = await db.select().from(forms).where(eq(forms.id, id));
  if (!form) return [];

  if (userId && form.userId !== userId) {
    throw new Error("Unauthorized: you do not own this form");
  }

  const messages = form?.messageHistory || [];

  return messages.slice(-20);
};

export const addFormMessages = async (
  id: string,
  newMessages: ExtendedMessage[],
  userId?: string
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  if (userId) {
    const [existing] = await db
      .select({ userId: forms.userId })
      .from(forms)
      .where(eq(forms.id, id));
    if (!existing || existing.userId !== userId) {
      throw new Error("Unauthorized: you do not own this form");
    }
  }

  const existingMessages = await getFormMessages(id);
  const combined = [...existingMessages, ...newMessages];
  // Cap stored history to prevent unbounded DB growth; reads already use slice(-20)
  const updatedMessages = combined.slice(-MAX_BUILDER_MESSAGES_STORED);

  const form = await db
    .update(forms)
    .set({ messageHistory: updatedMessages })
    .where(eq(forms.id, id));
  return form;
};

export const createFormSession = async (newFormSession: FormSessionsInsert) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const [formSession] = await db
    .insert(formSessions)
    .values(newFormSession)
    .returning();
  return formSession;
};

export const getFormSession = async (id: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const formSession = await db
    .select()
    .from(formSessions)
    .where(eq(formSessions.id, id));
  return formSession[0];
};

export const getFormSessionMessages = async (id: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const [session] = await db
    .select({ messageHistory: formSessions.messageHistory })
    .from(formSessions)
    .where(eq(formSessions.id, id));
  return session?.messageHistory || [];
};

export const addFormSessionMessages = async (
  id: string,
  newMessages: ExtendedMessage[]
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const existingMessages = await getFormSessionMessages(id);
  const updatedMessages = [...existingMessages, ...newMessages];

  const formSession = await db
    .update(formSessions)
    .set({ messageHistory: updatedMessages })
    .where(eq(formSessions.id, id));
  return formSession;
};

/** Directly set the full message history for a session without fetching first. */
export const setFormSessionMessages = async (
  id: string,
  messages: ExtendedMessage[]
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  return db
    .update(formSessions)
    .set({ messageHistory: messages })
    .where(eq(formSessions.id, id));
};

export const addFormSessionSummary = async (
  id: string,
  summary: FormAssistantResponse["summary"]
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  if (!summary) {
    throw new Error("Summary is required");
  }

  const formSession = await db
    .update(formSessions)
    .set({
      detailedSummary: summary.detailedSummary,
      quickSummary: summary.quickSummary,
      overallSentiment: summary.overallSentiment,
      structuredData: summary.structuredAnswers,
      completedAt: new Date(),
    })
    .where(eq(formSessions.id, id));
  return formSession;
};

export const getUserEmail = async (userId: string): Promise<string | null> => {
  if (!db) return null;
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId));
  return user?.email ?? null;
};

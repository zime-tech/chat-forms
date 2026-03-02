"use server";
import {
  ExtendedMessage,
  FormSessionsInsert,
  FormSettings,
  FormSettingsInsert,
  formCreationLogs,
  formSessions,
  forms,
} from "@/db/schema";
import { db } from "@/db/db";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { FormAssistantResponse } from "@/actions/form-assistant";

const MAX_FORMS_PER_USER = 10;

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
      messageHistory: forms.messageHistory,
      status: forms.status,
      closedAt: forms.closedAt,
      maxResponses: forms.maxResponses,
      createdAt: forms.createdAt,
      userId: forms.userId,
      responseCount: count(formSessions.id),
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
    .select({ count: count() })
    .from(formSessions)
    .where(eq(formSessions.formId, formId));

  return result?.count ?? 0;
};

export const isFormAcceptingResponses = async (formId: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const form = await getForm(formId);
  if (!form) return false;

  if (form.status === "closed") return false;

  if (form.closedAt && new Date(form.closedAt) <= new Date()) return false;

  if (form.maxResponses) {
    const responseCount = await getFormResponseCount(formId);
    if (responseCount >= form.maxResponses) return false;
  }

  return true;
};

export const updateForm = async (
  id: string,
  updatedForm: FormSettingsInsert
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const form = await db
    .update(forms)
    .set(updatedForm)
    .where(eq(forms.id, id))
    .returning();
  return form;
};

export const getFormMessages = async (id: string) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const [form] = await db.select().from(forms).where(eq(forms.id, id));

  const messages = form?.messageHistory || [];

  return messages.slice(-20);
};

export const addFormMessages = async (
  id: string,
  newMessages: ExtendedMessage[]
) => {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const existingMessages = await getFormMessages(id);
  const updatedMessages = [...existingMessages, ...newMessages];

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
  const formSession = await db
    .select()
    .from(formSessions)
    .where(eq(formSessions.id, id));
  return formSession[0]?.messageHistory || [];
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
    })
    .where(eq(formSessions.id, id));
  return formSession;
};

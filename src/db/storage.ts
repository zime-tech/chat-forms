"use server";
import {
  ExtendedMessage,
  FormSessionsInsert,
  FormSettings,
  FormSettingsInsert,
  formSessions,
  forms,
} from "@/db/schema";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { FormAssistantResponse } from "@/actions/form-assistant";

const MAX_FORMS_PER_USER = 10;

export const createForm = async (newForm: FormSettingsInsert) => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  if (!newForm.userId) {
    throw new Error("User ID is required");
  }

  // validate that the user didn't exceed the max number of forms
  const userForms = await getUserForms(newForm.userId);
  if (userForms.length >= MAX_FORMS_PER_USER) {
    throw new Error("You have reached the maximum number of forms");
  }

  const form = await db.insert(forms).values(newForm).returning();
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
    .select()
    .from(forms)
    .where(eq(forms.userId, userId))
    .orderBy(forms.createdAt);
  return allForms;
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
    })
    .where(eq(formSessions.id, id));
  return formSession;
};

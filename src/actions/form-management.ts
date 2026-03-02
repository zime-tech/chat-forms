"use server";

import { getSession } from "auth";
import { createForm, deleteForm, duplicateForm, getForm, getFormStatusFields, updateForm } from "@/db/storage";
import { revalidatePath } from "next/cache";
import { formTemplates } from "@/lib/form-templates";
import { FormSettingsInsert } from "@/db/schema";

export async function deleteFormAction(formId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await deleteForm(formId, session.user.id);
  revalidatePath("/dashboard");
}

export async function duplicateFormAction(formId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const duplicate = await duplicateForm(formId, session.user.id);
  revalidatePath("/dashboard");
  return duplicate;
}

export async function createFormFromTemplateAction(templateId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const template = formTemplates.find((t) => t.id === templateId);
  const settings = template?.settings ?? { title: "New Form" };

  const [form] = await createForm({
    ...settings,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return form;
}

export async function toggleFormStatusAction(formId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const form = await getFormStatusFields(formId);
  if (!form || form.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const isCurrentlyClosed =
    form.status === "closed" ||
    (form.closedAt != null && new Date(form.closedAt) <= new Date());

  if (isCurrentlyClosed) {
    await updateForm(formId, { status: "open", closedAt: null }, session.user.id);
  } else {
    await updateForm(formId, { status: "closed" }, session.user.id);
  }

  revalidatePath("/dashboard");
  return { newStatus: isCurrentlyClosed ? "open" : "closed" };
}

export async function updateFormSettingsAction(
  formId: string,
  settings: FormSettingsInsert
) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (settings.webhookUrl) {
    try {
      const parsed = new URL(settings.webhookUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Webhook URL must use http or https.");
      }
    } catch {
      throw new Error("Webhook URL must be a valid http or https URL.");
    }
  }

  // Explicitly pick only safe user-settable fields — prevents accidental
  // overwrite of messageHistory, userId, id, or createdAt if the caller's
  // object happens to carry extra DB-only properties at runtime.
  const safeFields: FormSettingsInsert = {
    title: settings.title,
    tone: settings.tone,
    persona: settings.persona,
    keyInformation: settings.keyInformation,
    targetAudience: settings.targetAudience,
    expectedCompletionTime: settings.expectedCompletionTime,
    aboutBusiness: settings.aboutBusiness,
    welcomeMessage: settings.welcomeMessage,
    callToAction: settings.callToAction,
    endScreenMessage: settings.endScreenMessage,
    status: settings.status,
    closedAt: settings.closedAt,
    maxResponses: settings.maxResponses,
    webhookUrl: settings.webhookUrl,
    accentColor: settings.accentColor,
    emailNotifications: settings.emailNotifications,
  };

  return updateForm(formId, safeFields, session.user.id);
}

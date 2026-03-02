"use server";

import { getSession } from "auth";
import { createForm, deleteForm, duplicateForm, getForm, updateForm } from "@/db/storage";
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

  const form = await getForm(formId);
  if (!form || form.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const isCurrentlyClosed =
    form.status === "closed" ||
    (form.closedAt != null && new Date(form.closedAt) <= new Date());

  if (isCurrentlyClosed) {
    await updateForm(formId, { ...form, status: "open", closedAt: null }, session.user.id);
  } else {
    await updateForm(formId, { ...form, status: "closed" }, session.user.id);
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

  return updateForm(formId, settings, session.user.id);
}

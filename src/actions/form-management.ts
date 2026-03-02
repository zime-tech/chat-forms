"use server";

import { getSession } from "auth";
import { createForm, deleteForm, duplicateForm, updateForm } from "@/db/storage";
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

export async function updateFormSettingsAction(
  formId: string,
  settings: FormSettingsInsert
) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return updateForm(formId, settings, session.user.id);
}

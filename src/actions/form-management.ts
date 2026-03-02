"use server";

import { getSession } from "auth";
import { createForm, deleteForm, duplicateForm } from "@/db/storage";
import { revalidatePath } from "next/cache";
import { formTemplates } from "@/lib/form-templates";

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

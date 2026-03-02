"use server";

import { getSession } from "auth";
import { deleteForm } from "@/db/storage";
import { revalidatePath } from "next/cache";

export async function deleteFormAction(formId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await deleteForm(formId, session.user.id);
  revalidatePath("/dashboard");
}

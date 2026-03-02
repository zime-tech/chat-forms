import { getSession } from "auth";
import { redirect } from "next/navigation";
import { getUserForms } from "@/db/storage";
import TemplatePickerClient from "./client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Form",
};

const MAX_FORMS = 10;

export default async function NewFormPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const forms = await getUserForms(session.user.id);
  if (forms.length >= MAX_FORMS) {
    redirect("/dashboard?error=limit");
  }

  return <TemplatePickerClient />;
}

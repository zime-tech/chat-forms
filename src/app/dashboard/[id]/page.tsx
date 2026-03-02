import type { Metadata } from "next";
import FormBuilderClient from "@/components/form-builder-client";
import { getForm, getFormMessages } from "@/db/storage";
import { getSession } from "auth";
import { redirect } from "next/navigation";
import { INITIAL_BUILDER_MESSAGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const form = await getForm(id);
  return { title: form?.title || "Form Builder" };
}

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // validate form belongs to user
  const form = await getForm(id);
  if (form?.userId !== session?.user?.id) {
    redirect("/dashboard");
  }

  const messages = await getFormMessages(id);

  if (messages.length === 0) {
    messages.push({
      id: "initial-message",
      role: "assistant",
      content: INITIAL_BUILDER_MESSAGE,
    });
  }

  return <FormBuilderClient formId={id} initialMessages={messages} createdAt={form?.createdAt?.toISOString()} />;
}

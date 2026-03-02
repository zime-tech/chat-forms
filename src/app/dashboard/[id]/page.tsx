import FormBuilderClient from "@/components/form-builder-client";
import { getForm, getFormMessages } from "@/db/storage";
import { getSession } from "auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
      content:
        "Let's start creating the form. Give me an idea of what is form created for?",
    });
  }

  return <FormBuilderClient formId={id} initialMessages={messages} createdAt={form?.createdAt?.toISOString()} />;
}

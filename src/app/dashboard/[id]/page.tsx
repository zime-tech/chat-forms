import FormBuilderClient from "@/components/form-builder-client";
import { createForm, getForm, getFormMessages } from "@/db/storage";
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

  let formId = id;
  if (id === "new") {
    const [newForm] = await createForm({
      title: "New Form",
      userId: session?.user?.id as string,
    });
    formId = newForm.id;
    return redirect(`/dashboard/${formId}`);
  }

  // validate form belongs to user
  const form = await getForm(formId);
  if (form?.userId !== session?.user?.id) {
    redirect("/dashboard");
  }

  const messages = await getFormMessages(formId);

  if (messages.length === 0) {
    messages.push({
      id: "initial-message",
      role: "assistant",
      content:
        "Let's start creating the form. Give me an idea of what is form created for?",
    });
  }

  return <FormBuilderClient formId={formId} initialMessages={messages} />;
}

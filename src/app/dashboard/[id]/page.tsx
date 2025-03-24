import FormBuilderClient from "@/components/form-builder-client";
import { createForm, getFormMessages } from "@/db/storage";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let formId = id;
  if (id === "new") {
    const [newForm] = await createForm({
      title: "New Form",
    });
    formId = newForm.id;
    return redirect(`/dashboard/${formId}`);
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

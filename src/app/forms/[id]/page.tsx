import FormAssistantClient from "@/components/form-assistant-client";
import { createFormSession, getForm } from "@/db/storage";
import { FormSettings } from "@/components/builder/types";

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // create a session id
  const session = await createFormSession({
    formId: id,
    messageHistory: [],
  });

  const formSettings = await getForm(id);

  return (
    <FormAssistantClient
      sessionId={session.id}
      formId={id}
      formSettings={formSettings as FormSettings}
    />
  );
}

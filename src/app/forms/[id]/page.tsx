import FormAssistantClient from "@/components/form-assistant-client";
import { createFormSession } from "@/db/storage";
import { v4 as uuidv4 } from "uuid";

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

  return <FormAssistantClient sessionId={session.id} formId={id} />;
}

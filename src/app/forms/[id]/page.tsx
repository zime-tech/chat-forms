import FormAssistantClient from "@/components/form-assistant-client";
import { getForm, isFormAcceptingResponses } from "@/db/storage";
import { FormSettings } from "@/components/builder/types";
import { notFound } from "next/navigation";
import FormClosedPage from "@/components/form-closed";

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let formSettings;
  try {
    formSettings = await getForm(id);
  } catch {
    notFound();
  }
  if (!formSettings) {
    notFound();
  }

  const accepting = await isFormAcceptingResponses(id);
  if (!accepting) {
    return <FormClosedPage title={formSettings.title} />;
  }

  return (
    <FormAssistantClient
      formId={id}
      formSettings={formSettings as FormSettings}
    />
  );
}

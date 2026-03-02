import FormAssistantClient from "@/components/form-assistant-client";
import { getForm } from "@/db/storage";
import { FormSettings } from "@/components/builder/types";
import { notFound } from "next/navigation";

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

  return (
    <FormAssistantClient
      formId={id}
      formSettings={formSettings as FormSettings}
    />
  );
}

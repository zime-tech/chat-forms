import type { Metadata } from "next";
import { Suspense } from "react";
import FormAssistantClient from "@/components/form-assistant-client";
import { getForm, isFormAcceptingResponses } from "@/db/storage";
import { FormSettings } from "@/components/builder/types";
import { notFound } from "next/navigation";
import FormClosedPage from "@/components/form-closed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const form = await getForm(id);
  if (!form) return { title: "Form Not Found" };
  return {
    title: form.title,
    description: form.aboutBusiness || "Fill out this conversational form powered by AI.",
    openGraph: {
      title: form.title,
      description: form.aboutBusiness || "Fill out this conversational form powered by AI.",
      type: "website",
    },
  };
}

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

  const accentColor = formSettings.accentColor;

  return (
    <div
      className="h-full"
      {...(accentColor ? { style: { "--accent": accentColor } as React.CSSProperties } : {})}
    >
      <Suspense>
        <FormAssistantClient
          formId={id}
          formSettings={formSettings as FormSettings}
        />
      </Suspense>
    </div>
  );
}

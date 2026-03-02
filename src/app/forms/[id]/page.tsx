import type { Metadata } from "next";
import { cache, Suspense } from "react";
import FormAssistantClient from "@/components/form-assistant-client";
import { getForm, isFormAcceptingResponses } from "@/db/storage";
import { FormSettings } from "@/components/builder/types";
import { notFound } from "next/navigation";
import FormClosedPage from "@/components/form-closed";

// Deduplicate getForm calls within the same request (generateMetadata + page body)
const getFormCached = cache(getForm);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const form = await getFormCached(id);
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
    formSettings = await getFormCached(id);
  } catch {
    notFound();
  }
  if (!formSettings) {
    notFound();
  }

  const { accepting, reason } = await isFormAcceptingResponses(id, formSettings);
  if (!accepting) {
    return <FormClosedPage title={formSettings.title} reason={reason} />;
  }

  const accentColor = formSettings.accentColor;

  return (
    <div
      className="h-full"
      {...(accentColor ? { style: { "--accent": accentColor } as React.CSSProperties } : {})}
    >
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading form...</p>
            </div>
          </div>
        }
      >
        <FormAssistantClient
          formId={id}
          formSettings={formSettings as FormSettings}
        />
      </Suspense>
    </div>
  );
}

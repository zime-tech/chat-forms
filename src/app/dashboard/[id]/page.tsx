import type { Metadata } from "next";
import { cache } from "react";
import FormBuilderClient from "@/components/form-builder-client";
import { getForm, getFormResponseCount } from "@/db/storage";
import { getSession } from "auth";
import { redirect } from "next/navigation";
import { INITIAL_BUILDER_MESSAGE } from "@/lib/constants";

// Deduplicate getForm calls within the same request (generateMetadata + page body)
const getFormCached = cache(getForm);

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const form = await getFormCached(id);
  const title = form?.title || "Form Builder";
  return {
    title,
    description: form ? `Build and manage your "${title}" conversational form.` : undefined,
    robots: { index: false },
  };
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

  // validate form belongs to user (getFormCached reuses the result from generateMetadata)
  const form = await getFormCached(id);
  if (form?.userId !== session?.user?.id) {
    redirect("/dashboard");
  }

  const responseCount = await getFormResponseCount(id);

  // Inline message extraction from the already-loaded form (avoids a third forms table query)
  const messages = (form?.messageHistory ?? []).slice(-20);
  if (messages.length === 0) {
    messages.push({
      id: "initial-message",
      role: "assistant",
      content: INITIAL_BUILDER_MESSAGE,
    });
  }

  return (
    <FormBuilderClient
      formId={id}
      initialMessages={messages}
      createdAt={form?.createdAt?.toISOString()}
      responseCount={responseCount}
    />
  );
}

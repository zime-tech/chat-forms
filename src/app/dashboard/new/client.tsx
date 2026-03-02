"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formTemplates } from "@/lib/form-templates";
import { createFormFromTemplateAction } from "@/actions/form-management";
import {
  ArrowLeft,
  FileText,
  MessageSquareText,
  Briefcase,
  Users,
  BarChart3,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Feedback: MessageSquareText,
  HR: Users,
  Events: CalendarCheck,
  Sales: BarChart3,
};

export default function TemplatePickerClient() {
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);

  const handleSelectTemplate = async (templateId: string) => {
    setCreating(templateId);
    try {
      const form = await createFormFromTemplateAction(templateId);
      router.push(`/dashboard/${form.id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("maximum")) {
        toast.error("You've reached the maximum number of forms");
        router.push("/dashboard?error=limit");
      } else {
        toast.error("Failed to create form");
      }
      setCreating(null);
    }
  };

  const handleBlankForm = async () => {
    setCreating("blank");
    try {
      const form = await createFormFromTemplateAction("blank");
      router.push(`/dashboard/${form.id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("maximum")) {
        toast.error("You've reached the maximum number of forms");
        router.push("/dashboard?error=limit");
      } else {
        toast.error("Failed to create form");
      }
      setCreating(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create a new form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a template or create a blank form
        </p>
      </div>

      {/* Blank form card */}
      <button
        onClick={handleBlankForm}
        disabled={creating !== null}
        className="mb-6 w-full rounded-xl border-2 border-dashed border-border bg-surface p-6 text-left hover:border-accent/30 hover:bg-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            {creating === "blank" ? (
              <Loader2 size={18} className="text-muted-foreground animate-spin" />
            ) : (
              <FileText size={18} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-foreground">Blank form</h3>
            <p className="text-sm text-muted-foreground">
              Start from scratch with the AI form builder
            </p>
          </div>
        </div>
      </button>

      {/* Templates */}
      <div className="mb-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Templates
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {formTemplates.map((template) => {
          const Icon = categoryIcons[template.category] || Briefcase;
          const isCreating = creating === template.id;

          return (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              disabled={creating !== null}
              className="rounded-xl border border-border bg-surface p-5 text-left hover:border-accent/30 hover:bg-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  {isCreating ? (
                    <Loader2 size={16} className="text-accent animate-spin" />
                  ) : (
                    <Icon size={16} className="text-accent" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground">{template.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-snug">
                    {template.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {template.category}
                    </span>
                    <span>{template.settings.expectedCompletionTime}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

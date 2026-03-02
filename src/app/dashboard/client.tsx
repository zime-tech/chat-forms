"use client";

import { FormSettings } from "@/db/schema";
import { useState, useMemo } from "react";
import {
  Plus,
  Clock,
  Copy,
  ExternalLink,
  Check,
  MessageSquareText,
  Trash2,
  Users,
  Search,
  ArrowUpDown,
  Files,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { deleteFormAction, duplicateFormAction } from "@/actions/form-management";
import { toast } from "sonner";

const MAX_FORMS = 10;

type FormWithCount = FormSettings & { responseCount: number };

export default function DashboardClientPage({
  forms,
  error,
}: {
  forms: FormWithCount[];
  error?: string;
}) {
  const atLimit = forms.length >= MAX_FORMS;
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "responses" | "title">("newest");

  const filteredForms = useMemo(() => {
    let result = forms;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.title.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "newest":
        result = [...result].sort((a, b) =>
          (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
          (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        );
        break;
      case "oldest":
        result = [...result].sort((a, b) =>
          (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
          (b.createdAt ? new Date(b.createdAt).getTime() : 0)
        );
        break;
      case "responses":
        result = [...result].sort((a, b) => b.responseCount - a.responseCount);
        break;
      case "title":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [forms, searchQuery, sortBy]);

  const handleCopyLink = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/forms/${formId}`);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenForm = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    window.open(`/forms/${formId}`, "_blank");
  };

  const handleDeleteClick = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(formId);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDeleteId) return;

    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);

    try {
      await deleteFormAction(confirmDeleteId);
      toast.success("Form deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete form");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleDuplicate = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    try {
      await duplicateFormAction(formId);
      toast.success("Form duplicated");
      router.refresh();
    } catch {
      toast.error("Failed to duplicate form");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Forms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {forms.length} {forms.length === 1 ? "form" : "forms"} created
          </p>
        </div>

        {atLimit ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
            <Plus size={16} />
            Limit reached ({MAX_FORMS})
          </span>
        ) : (
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New form
          </Link>
        )}
      </div>

      {/* Error banner */}
      {error === "limit" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <MessageSquareText size={16} className="shrink-0" />
          <span>You&apos;ve reached the limit of {MAX_FORMS} forms. Delete an existing form to create a new one.</span>
        </div>
      )}

      {/* Search and sort */}
      {forms.length > 1 && (
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none rounded-lg border border-border bg-surface pl-8 pr-8 py-2 text-sm text-foreground cursor-pointer hover:bg-surface-hover transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="responses">Most responses</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Forms list */}
      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <MessageSquareText size={24} className="text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No forms yet</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Create your first AI-powered conversational form to start collecting responses.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Create your first form
          </Link>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {filteredForms.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No forms matching &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
          {filteredForms.map((form) => (
            <div
              key={form.id}
              onClick={() => {
                if (deletingId === form.id || confirmDeleteId === form.id)
                  return;
                router.push(`/dashboard/${form.id}`);
              }}
              className={`group flex items-center justify-between rounded-xl border bg-surface px-5 py-4 cursor-pointer hover:border-accent/30 hover:bg-surface-hover transition-all ${
                deletingId === form.id
                  ? "opacity-50 pointer-events-none border-border"
                  : "border-border"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">
                    {form.title}
                  </h3>
                  {(form.status === "closed" || (form.closedAt && new Date(form.closedAt) <= new Date())) && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      Closed
                    </span>
                  )}
                  {form.maxResponses && form.responseCount >= form.maxResponses && form.status !== "closed" && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Limit reached
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  {form.responseCount > 0 && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Users size={12} />
                      {form.responseCount}{" "}
                      {form.responseCount === 1 ? "response" : "responses"}
                    </span>
                  )}
                  {form.tone && (
                    <span className="truncate">{form.tone}</span>
                  )}
                  {form.expectedCompletionTime && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock size={12} />
                      {form.expectedCompletionTime}
                    </span>
                  )}
                  {form.createdAt && (
                    <span className="shrink-0">
                      {formatDistanceToNow(new Date(form.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                {confirmDeleteId === form.id ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <span className="text-xs text-muted-foreground">Delete?</span>
                    <button
                      onClick={handleConfirmDelete}
                      className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      Yes
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopyLink(e, form.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Copy form link"
                    >
                      {copiedId === form.id ? (
                        <Check size={14} className="text-success" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleOpenForm(e, form.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Open form"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, form.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Duplicate form"
                    >
                      <Files size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, form.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                      title="Delete form"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FormBuilderError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Failed to load form
        </h1>
        <p className="text-sm text-muted-foreground">
          This form could not be loaded. It may have been deleted or you may not
          have access to it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

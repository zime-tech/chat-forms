"use client";

import { AlertTriangle, RotateCcw, MessageSquareText } from "lucide-react";

export default function FormError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      <header className="flex h-14 items-center border-b border-border bg-surface px-6 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-accent" />
          <span className="font-semibold text-foreground">Chat Forms</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Unable to load this form
          </h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong while loading. Please try again.
          </p>
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

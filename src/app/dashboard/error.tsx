"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          We couldn&apos;t load your dashboard. This might be a temporary issue.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          <RotateCcw size={14} />
          Try again
        </button>
      </div>
    </div>
  );
}

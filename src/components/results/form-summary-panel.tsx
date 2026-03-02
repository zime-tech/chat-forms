"use client";

import { getOverallSummary } from "@/actions/form-results";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { formOverallSummarySchema } from "@/types/promp-schema";
import { z } from "zod";

type SummaryData = z.infer<typeof formOverallSummarySchema> & { responseCount: number };

interface FormSummaryPanelProps {
  formId: string;
}

export default function FormSummaryPanel({ formId }: FormSummaryPanelProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOverallSummary(formId);
      setSummary(result);
      setGeneratedAt(new Date());
    } catch {
      setError("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [formId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Analyzing responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchSummary}
          className="rounded-md bg-accent px-3 py-1.5 text-xs text-accent-foreground hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No summary data available</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <span className="text-xs font-medium text-foreground">AI Summary</span>
          {summary && generatedAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Based on {summary.responseCount} {summary.responseCount === 1 ? "response" : "responses"}
              {" · "}generated {formatDistanceToNow(generatedAt, { addSuffix: true })}
            </p>
          )}
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          aria-label="Refresh summary"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {summary.sentiment && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Overall Sentiment</p>
            <p className="text-sm text-foreground">{summary.sentiment}</p>
          </div>
        )}

        {summary.summary && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Summary</p>
            <p className="text-sm text-foreground whitespace-pre-line">{summary.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

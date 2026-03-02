"use client";

import { useEffect, useState } from "react";
import {
  getFormSessions,
  getFormSessionDetails,
  getFormSessionsForExport,
  FormSessionBasic,
  FormSessionDetail,
} from "@/actions/form-results";
import { AlertTriangle, Calendar, Download, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FormResultsPanelProps {
  formId: string;
}

export default function FormResultsPanel({ formId }: FormResultsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<FormSessionBasic[]>([]);
  const [selectedSession, setSelectedSession] = useState<FormSessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [formId]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFormSessions(formId);
      setSessions(result || []);
      if (result?.length > 0 && !selectedSession) {
        setSelectedSession(result[0]);
      }
    } catch {
      setError("Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const details = await getFormSessionDetails(sessionId);
      if (details) setSelectedSession(details);
    } catch {
      setError("Failed to load response details");
    }
  };

  const handleExport = async () => {
    try {
      const data = await getFormSessionsForExport(formId);
      const headers = ["Date", "Summary", "Details", "Sentiment"];
      const rows = data.map((s) => [
        s.createdAt ? new Date(s.createdAt).toISOString() : "",
        `"${(s.quickSummary || "").replace(/"/g, '""')}"`,
        `"${(s.detailedSummary || "").replace(/"/g, '""')}"`,
        s.overallSentiment || "",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses-${formId.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export responses");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchSessions}
          className="rounded-md bg-accent px-3 py-1.5 text-xs text-accent-foreground hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No responses yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Responses will appear here when people complete your form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-xs font-medium text-foreground">
          {sessions.length} {sessions.length === 1 ? "response" : "responses"}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Export as CSV"
          >
            <Download size={12} />
          </button>
          <button
            onClick={fetchSessions}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* List */}
        <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-border overflow-y-auto max-h-[40%] md:max-h-none">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={`w-full text-left px-3 py-2.5 text-xs border-b border-border hover:bg-surface-hover transition-colors ${
                selectedSession?.id === session.id ? "bg-accent/5 border-l-2 border-l-accent" : ""
              }`}
            >
              <p className="font-medium text-foreground truncate">
                {session.quickSummary || "Unlabeled"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-muted-foreground">
                <Calendar size={10} />
                {session.createdAt
                  ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
                  : "Unknown"}
              </p>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedSession ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">
                  {selectedSession.quickSummary || "Unlabeled response"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedSession.createdAt
                    ? formatDistanceToNow(new Date(selectedSession.createdAt), { addSuffix: true })
                    : "Unknown date"}
                </p>
              </div>

              {selectedSession.overallSentiment && (
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Sentiment</p>
                  <p className="text-sm text-foreground">{selectedSession.overallSentiment}</p>
                </div>
              )}

              {selectedSession.detailedSummary && (
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Details</p>
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {selectedSession.detailedSummary}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs text-muted-foreground">Select a response</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

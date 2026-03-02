"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getFormSessions,
  getFormSessionDetails,
  getFormSessionsForExport,
  getFormAnalytics,
  toggleSessionFlagged,
  toggleSessionReviewed,
  FormSessionBasic,
  FormSessionDetail,
  FormAnalytics,
} from "@/actions/form-results";
import { AlertTriangle, Calendar, Check, Copy, Download, RefreshCw, Loader2, Search, X, BarChart3, Clock, TrendingUp, Users, Flag, CheckSquare, MessageCircle, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SENTIMENT_OPTIONS = ["all", "positive", "neutral", "negative"] as const;
type SentimentFilter = (typeof SENTIMENT_OPTIONS)[number];

const DATE_RANGE_OPTIONS = ["7d", "30d", "90d", "all"] as const;
type DateRangeFilter = (typeof DATE_RANGE_OPTIONS)[number];

interface FormResultsPanelProps {
  formId: string;
}

export default function FormResultsPanel({ formId }: FormResultsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<FormSessionBasic[]>([]);
  const [selectedSession, setSelectedSession] = useState<FormSessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const sessionListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    fetchAnalytics();
  }, [formId]);

  useEffect(() => {
    if (!selectedSession || !sessionListRef.current) return;
    const btn = sessionListRef.current.querySelector<HTMLElement>(
      `[data-session-id="${selectedSession.id}"]`
    );
    btn?.scrollIntoView({ block: "nearest" });
  }, [selectedSession?.id]);

  const fetchAnalytics = async () => {
    try {
      const result = await getFormAnalytics(formId);
      setAnalytics(result);
    } catch {
      // Analytics are non-critical, silently fail
    }
  };

  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(
        (s) => s.createdAt && new Date(s.createdAt) >= cutoff
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.quickSummary?.toLowerCase().includes(q) ||
          s.detailedSummary?.toLowerCase().includes(q) ||
          s.structuredData?.some(
            (a) =>
              a.question.toLowerCase().includes(q) ||
              a.answer.toLowerCase().includes(q)
          )
      );
    }

    if (sentimentFilter !== "all") {
      filtered = filtered.filter(
        (s) => s.overallSentiment?.toLowerCase() === sentimentFilter
      );
    }

    return filtered;
  }, [sessions, searchQuery, sentimentFilter, dateRange]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFormSessions(formId);
      setSessions(result || []);
      if (result?.length > 0 && !selectedSession) {
        const details = await getFormSessionDetails(result[0].id);
        if (details) setSelectedSession(details);
      }
    } catch {
      setError("Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setDetailLoading(true);
    try {
      const details = await getFormSessionDetails(sessionId);
      if (details) {
        setSelectedSession(details);
        setMobileShowDetail(true);
      }
    } catch {
      setError("Failed to load response details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleFlag = async () => {
    if (!selectedSession) return;
    const newVal = !selectedSession.flagged;
    setSelectedSession({ ...selectedSession, flagged: newVal });
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSession.id ? { ...s, flagged: newVal } : s))
    );
    await toggleSessionFlagged(selectedSession.id, newVal);
  };

  const handleToggleReviewed = async () => {
    if (!selectedSession) return;
    const newVal = !selectedSession.reviewed;
    setSelectedSession({ ...selectedSession, reviewed: newVal });
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSession.id ? { ...s, reviewed: newVal } : s))
    );
    await toggleSessionReviewed(selectedSession.id, newVal);
  };

  const handleExport = async () => {
    try {
      const data = await getFormSessionsForExport(formId);
      const headers = ["Date", "Summary", "Sentiment", "Details", "Structured Answers"];
      const rows = data.map((s) => {
        const structuredStr = s.structuredData
          ? s.structuredData.map((a) => `${a.question}: ${a.answer}`).join("; ")
          : "";
        return [
          s.createdAt ? new Date(s.createdAt).toISOString() : "",
          `"${(s.quickSummary || "").replace(/"/g, '""')}"`,
          s.overallSentiment || "",
          `"${(s.detailedSummary || "").replace(/"/g, '""')}"`,
          `"${structuredStr.replace(/"/g, '""')}"`,
        ];
      });

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses-${formId.slice(0, 8)}.csv`;
      a.click();
      // Defer revocation so the browser can initiate the download first
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      setError("Failed to export responses");
    }
  };

  const hasActiveFilters = searchQuery.trim() !== "" || sentimentFilter !== "all";

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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-xs font-medium text-foreground">
          {hasActiveFilters
            ? `${filteredSessions.length} of ${sessions.length} responses`
            : `${sessions.length} ${sessions.length === 1 ? "response" : "responses"}`}
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

      {/* Analytics summary */}
      {analytics && analytics.totalStarted > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px border-b border-border bg-border">
          <div className="bg-background px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
              <Users size={10} />
              <span className="text-[10px] font-medium">Started</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{analytics.totalStarted}</p>
          </div>
          <div className="bg-background px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
              <BarChart3 size={10} />
              <span className="text-[10px] font-medium">Completed</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{analytics.totalCompleted}</p>
          </div>
          <div className="bg-background px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
              <TrendingUp size={10} />
              <span className="text-[10px] font-medium">Completion</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{analytics.completionRate}%</p>
          </div>
          <div className="bg-background px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
              <Clock size={10} />
              <span className="text-[10px] font-medium">Avg. time</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {analytics.avgCompletionSeconds
                ? analytics.avgCompletionSeconds < 60
                  ? `${analytics.avgCompletionSeconds}s`
                  : `${Math.round(analytics.avgCompletionSeconds / 60)}m`
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* List sidebar - hidden on mobile when detail is shown */}
        <div className={`w-full md:w-[35%] border-b md:border-b-0 md:border-r border-border flex flex-col md:flex ${mobileShowDetail ? "hidden" : "flex flex-1"}`}>
          {/* Search and filters */}
          <div className="border-b border-border p-2 space-y-1.5">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                aria-label="Search responses"
                placeholder="Search responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-border bg-surface pl-7 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setDateRange(option)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      dateRange === option
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option === "all" ? "All time" : option}
                  </button>
                ))}
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex gap-1">
                {SENTIMENT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSentimentFilter(option)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      sentimentFilter === option
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session list */}
          <div
            ref={sessionListRef}
            className="flex-1 overflow-y-auto focus:outline-none"
            tabIndex={0}
            onKeyDown={(e) => {
              if (!filteredSessions.length) return;
              const idx = selectedSession
                ? filteredSessions.findIndex((s) => s.id === selectedSession.id)
                : -1;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = filteredSessions[Math.min(idx + 1, filteredSessions.length - 1)];
                if (next) handleSelectSession(next.id);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const prev = filteredSessions[Math.max(idx - 1, 0)];
                if (prev) handleSelectSession(prev.id);
              }
            }}
          >
            {filteredSessions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-muted-foreground">No matching responses</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session.id}
                  data-session-id={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`w-full text-left px-3 py-2.5 text-xs border-b border-border hover:bg-surface-hover transition-colors ${
                    selectedSession?.id === session.id ? "bg-accent/5 border-l-2 border-l-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-foreground truncate flex-1">
                      {session.quickSummary || "Unlabeled"}
                    </p>
                    {session.flagged && (
                      <Flag size={10} className="shrink-0 text-amber-500 fill-amber-500" />
                    )}
                    {session.reviewed && (
                      <CheckSquare size={10} className="shrink-0 text-success" />
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {session.createdAt
                        ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
                        : "Unknown"}
                    </span>
                    {session.overallSentiment && (
                      <span
                        className={`rounded-full px-1.5 py-px text-[9px] font-medium ${
                          session.overallSentiment.toLowerCase() === "positive"
                            ? "bg-success/10 text-success"
                            : session.overallSentiment.toLowerCase() === "negative"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {session.overallSentiment}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail - full screen on mobile when shown */}
        <div className={`flex-1 overflow-y-auto p-4 md:block ${mobileShowDetail ? "block" : "hidden"} relative`}>
          {detailLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {selectedSession ? (
            <div className="space-y-4">
              {/* Mobile back button */}
              <button
                onClick={() => setMobileShowDetail(false)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors md:hidden"
              >
                <ArrowLeft size={12} />
                Back to list
              </button>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground">
                    {selectedSession.quickSummary || "Unlabeled response"}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedSession.createdAt
                      ? formatDistanceToNow(new Date(selectedSession.createdAt), { addSuffix: true })
                      : "Unknown date"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleToggleFlag}
                    aria-label={selectedSession.flagged ? "Remove flag" : "Flag response"}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      selectedSession.flagged
                        ? "bg-amber-500/10 text-amber-500"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Flag size={14} className={selectedSession.flagged ? "fill-amber-500" : ""} />
                  </button>
                  <button
                    onClick={handleToggleReviewed}
                    aria-label={selectedSession.reviewed ? "Mark as unreviewed" : "Mark as reviewed"}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      selectedSession.reviewed
                        ? "bg-success/10 text-success"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <CheckSquare size={14} />
                  </button>
                </div>
              </div>

              {selectedSession.overallSentiment && (
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Sentiment</p>
                  <p className="text-sm text-foreground">{selectedSession.overallSentiment}</p>
                </div>
              )}

              {selectedSession.structuredData && selectedSession.structuredData.length > 0 && (
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Responses</p>
                  <div className="space-y-2.5">
                    {selectedSession.structuredData.map((item, i) => (
                      <div key={i}>
                        <p className="text-xs font-medium text-muted-foreground">
                          {item.question}
                        </p>
                        <p className="mt-0.5 text-sm text-foreground">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
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

              {selectedSession.messageHistory && selectedSession.messageHistory.length > 0 && (
                <div className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <MessageCircle size={11} />
                      Conversation
                    </p>
                    <button
                      onClick={() => {
                        const lines = selectedSession.messageHistory!
                          .filter((m) => m.content && m.content !== "start_form")
                          .map((m) => `${m.role === "assistant" ? "Bot" : "You"}: ${m.content}`)
                          .join("\n\n");
                        navigator.clipboard.writeText(lines);
                        setCopiedTranscript(true);
                        setTimeout(() => setCopiedTranscript(false), 2000);
                      }}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {copiedTranscript ? (
                        <><Check size={10} className="text-success" /> Copied</>
                      ) : (
                        <><Copy size={10} /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedSession.messageHistory
                      .filter((msg) => msg.content && msg.content !== "start_form")
                      .map((msg, i) => (
                        <div
                          key={i}
                          className={`text-xs ${
                            msg.role === "assistant"
                              ? "text-foreground"
                              : "text-muted-foreground pl-3 border-l-2 border-accent/30"
                          }`}
                        >
                          <span className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground">
                            {msg.role === "assistant" ? "Bot" : "User"}
                          </span>
                          <p className="mt-0.5 whitespace-pre-line">{msg.content}</p>
                        </div>
                      ))}
                  </div>
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

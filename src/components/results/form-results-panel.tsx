"use client";

import { useEffect, useState } from "react";
import {
  getFormSessions,
  getFormSessionDetails,
  FormSessionBasic,
  FormSessionDetail,
} from "@/actions/form-results";
import { AlertTriangle, Calendar, Clock, RefreshCw, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FormResultsPanelProps {
  formId: string;
}

export default function FormResultsPanel({ formId }: FormResultsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<FormSessionBasic[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<FormSessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions on mount and when formId changes
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
    } catch (err) {
      setError("Failed to load form sessions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const sessionDetails = await getFormSessionDetails(sessionId);
      if (sessionDetails) {
        setSelectedSession(sessionDetails);
      }
    } catch (err) {
      setError("Failed to load session details");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
          <p className="text-white/70">Loading form responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <p className="text-white/70">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-2 px-3 py-1.5 text-xs rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 mb-2">No form submissions yet</p>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            When users complete your form, their responses and summaries will
            appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">Form Responses</h3>
        <button
          onClick={fetchSessions}
          className="p-1.5 rounded-md hover:bg-purple-600/30 text-white/70 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex h-full">
        {/* Session list sidebar */}
        <div className="w-[35%] border-r border-white/10 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-white/50 border-b border-white/10">
            {sessions.length} {sessions.length === 1 ? "response" : "responses"}
          </div>

          <div className="divide-y divide-white/10">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-purple-600/20 transition-colors ${
                  selectedSession?.id === session.id ? "bg-purple-600/30" : ""
                }`}
              >
                <div className="font-medium text-white/90 truncate">
                  {session.quickSummary || "Unlabeled response"}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-white/50">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {session.createdAt
                      ? formatDistanceToNow(new Date(session.createdAt), {
                          addSuffix: true,
                        })
                      : "Unknown date"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session details */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedSession ? (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-white">
                  {selectedSession.quickSummary || "Unlabeled response"}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {selectedSession.createdAt
                        ? formatDistanceToNow(
                            new Date(selectedSession.createdAt),
                            { addSuffix: true }
                          )
                        : "Unknown date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Anonymous user</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {selectedSession.overallSentiment && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">
                      Overall Sentiment
                    </h4>
                    <p className="text-white/80">
                      {selectedSession.overallSentiment}
                    </p>
                  </div>
                )}

                {selectedSession.quickSummary && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">
                      Quick Summary
                    </h4>
                    <p className="text-white/80">
                      {selectedSession.quickSummary}
                    </p>
                  </div>
                )}

                {selectedSession.detailedSummary && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">
                      Detailed Summary
                    </h4>
                    <p className="text-white/80 whitespace-pre-line">
                      {selectedSession.detailedSummary}
                    </p>
                  </div>
                )}

                {!selectedSession.quickSummary &&
                  !selectedSession.detailedSummary &&
                  !selectedSession.overallSentiment && (
                    <div className="text-center py-8">
                      <p className="text-white/50">
                        No summary data available for this response
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-white/50">Select a response to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

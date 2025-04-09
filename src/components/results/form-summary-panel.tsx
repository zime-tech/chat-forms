import { FormSessionBasic, getOverallSummary } from "@/actions/form-results";
import { RefreshCw, PieChart, TrendingUp, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formOverallSummarySchema } from "@/types/promp-schema";
import { z } from "zod";

interface FormSummaryPanelProps {
  formId: string;
}

export default function FormSummaryPanel({ formId }: FormSummaryPanelProps) {
  const [summary, setSummary] = useState<z.infer<
    typeof formOverallSummarySchema
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getOverallSummary(formId);
      setSummary(summary);
    } catch (err) {
      setError("Failed to load form summary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [formId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">Form Summary</h3>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="text-white/70 hover:text-white transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
              <p className="text-white/70">Analyzing form responses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <p className="text-white/70">{error}</p>
              <button
                onClick={fetchSummary}
                className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : !summary ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/50">No summary data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {summary.sentiment && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10 shadow-md">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <TrendingUp size={16} className="mr-2 text-purple-400" />
                  Overall Sentiment
                </h4>
                <p className="text-white/80 whitespace-pre-line">
                  {summary.sentiment}
                </p>
              </div>
            )}

            {summary.summary && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10 shadow-md">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <PieChart size={16} className="mr-2 text-blue-400" />
                  Summary
                </h4>
                <p className="text-white/80 whitespace-pre-line">
                  {summary.summary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

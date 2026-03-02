"use client";

import { Settings, ArrowRight, Clock } from "lucide-react";
import { FormSettings } from "./types";

interface FormSettingsSummaryProps {
  formSettings: FormSettings;
  onDetailedView: () => void;
}

export default function FormSettingsSummary({
  formSettings,
  onDetailedView,
}: FormSettingsSummaryProps) {
  return (
    <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <Settings size={12} />
          Settings updated
        </div>
        <button
          onClick={onDetailedView}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight size={10} />
        </button>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Title</span>
          <span className="font-medium text-foreground">{formSettings.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tone</span>
          <span className="text-foreground">{formSettings.tone}</span>
        </div>
        {formSettings.expectedCompletionTime && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="flex items-center gap-1 text-foreground">
              <Clock size={10} />
              {formSettings.expectedCompletionTime}
            </span>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1">
          {formSettings.keyInformation?.slice(0, 4).map((step: string, i: number) => (
            <span
              key={i}
              className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent"
            >
              {step}
            </span>
          ))}
          {formSettings.keyInformation?.length > 4 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{formSettings.keyInformation.length - 4} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

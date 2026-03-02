"use client";

import { Bot, User } from "lucide-react";
import { ExtendedMessage } from "./types";
import FormSettingsSummary from "./form-settings-summary";

interface MessageItemProps {
  message: ExtendedMessage;
  isLastFormUpdate: boolean;
  formSettings: any | null;
  onDetailedView: () => void;
}

export default function MessageItem({
  message,
  isLastFormUpdate,
  formSettings,
  onDetailedView,
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        isUser ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block rounded-xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-accent text-accent-foreground"
            : "bg-surface border border-border text-foreground"
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {!isUser && isLastFormUpdate && formSettings && (
          <FormSettingsSummary
            formSettings={formSettings}
            onDetailedView={onDetailedView}
          />
        )}
      </div>
    </div>
  );
}

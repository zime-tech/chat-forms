"use client";

import { User, MessageCircle } from "lucide-react";
import { ExtendedMessage } from "./types";
import FormSettingsSummary from "./form-settings-summary";

interface MessageItemProps {
  message: ExtendedMessage;
  isLastFormUpdate: boolean;
  formSettings: any | null;
  setShowPreview: (show: boolean) => void;
}

export default function MessageItem({
  message,
  isLastFormUpdate,
  formSettings,
  setShowPreview,
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 animate-fadeIn
          ${
            isUser
              ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/10"
              : "bg-white/5 backdrop-blur-sm border border-white/5"
          }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center
              ${
                isUser
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500"
              }`}
          >
            {isUser ? <User size={14} /> : <MessageCircle size={14} />}
          </div>
          <div className="font-medium text-sm text-white/80">
            {isUser ? "You" : "Assistant"}
          </div>
        </div>
        <div className="whitespace-pre-wrap text-white/90">
          {message.content}
        </div>

        {!isUser && isLastFormUpdate && formSettings && (
          <FormSettingsSummary
            formSettings={formSettings}
            setShowPreview={setShowPreview}
          />
        )}
      </div>
    </div>
  );
}

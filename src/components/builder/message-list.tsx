"use client";

import { useRef, useEffect } from "react";
import { ExtendedMessage } from "./types";
import MessageItem from "./message-item";

interface MessageListProps {
  messages: ExtendedMessage[];
  lastFormUpdateMessageId: string | null;
  formSettings: any | null;
  setShowPreview: (show: boolean) => void;
}

export default function MessageList({
  messages,
  lastFormUpdateMessageId,
  formSettings,
  setShowPreview,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message, index) => (
          <MessageItem
            key={`${message.id}-${index}`}
            message={message}
            isLastFormUpdate={message.id === lastFormUpdateMessageId}
            formSettings={formSettings}
            setShowPreview={setShowPreview}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

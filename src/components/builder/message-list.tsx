"use client";

import { useRef, useEffect } from "react";
import { ExtendedMessage } from "./types";
import MessageItem from "./message-item";

interface MessageListProps {
  messages: ExtendedMessage[];
  lastFormUpdateMessageId: string | null;
  formSettings: any | null;
  onDetailedView: () => void;
  isLoading?: boolean;
}

export default function MessageList({
  messages,
  lastFormUpdateMessageId,
  formSettings,
  onDetailedView,
  isLoading,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        {messages.map((message, index) => (
          <MessageItem
            key={`${message.id}-${index}`}
            message={message}
            isLastFormUpdate={message.id === lastFormUpdateMessageId}
            formSettings={formSettings}
            onDetailedView={onDetailedView}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 px-1 py-2">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-[bounce_1.4s_ease-in-out_infinite]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
            </div>
            <span className="text-xs text-muted-foreground">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

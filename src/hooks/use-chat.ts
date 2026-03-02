"use client";

import { Message } from "@ai-sdk/react";
import { useState, useRef } from "react";

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000];

function isRetryableError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("timeout") ||
      msg.includes("too long") ||
      msg.includes("network") ||
      msg.includes("fetch failed") ||
      msg.includes("failed to fetch") ||
      msg.includes("rate") ||
      msg.includes("503") ||
      msg.includes("502") ||
      msg.includes("429")
    );
  }
  return false;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ChatOptions<TResponse> = {
  sendMessage: (formId: string, message: Message) => Promise<Message[]>;
  formId: string;
  initialMessages?: Message[];
};

export function useChat<TResponse>({
  sendMessage,
  formId,
  initialMessages = [],
}: ChatOptions<TResponse>) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement;
    const userMessage = input.value;
    input.value = "";

    if (!userMessage.trim()) return;

    const messageId = `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const message: Message = {
      id: messageId,
      role: "user",
      content: userMessage,
    };

    const prevMessages = messages;
    setMessages([...messages, message]);
    setIsLoading(true);
    setError(null);
    retryCountRef.current = 0;

    const attemptSend = async (): Promise<Message[]> => {
      try {
        return await sendMessage(formId, message);
      } catch (err) {
        if (isRetryableError(err) && retryCountRef.current < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCountRef.current];
          retryCountRef.current++;
          await wait(delay);
          return attemptSend();
        }
        throw err;
      }
    };

    try {
      const updatedMessages = await attemptSend();
      setMessages(updatedMessages);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setMessages(prevMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    messages,
    isLoading,
    error,
    clearError,
    handleSubmit,
  };
}

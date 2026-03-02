"use client";

import { Message } from "@ai-sdk/react";
import { useState } from "react";

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

    setMessages([...messages, message]);
    setIsLoading(true);
    setError(null);

    try {
      const updatedMessages = await sendMessage(formId, message);
      setMessages(updatedMessages);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      // Revert to messages before the user message
      setMessages(messages);
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

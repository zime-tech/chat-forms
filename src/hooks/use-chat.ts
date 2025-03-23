"use client";

import { Message } from "@ai-sdk/react";
import { useEffect, useState } from "react";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement;
    const userMessage = input.value;
    input.value = "";

    if (!userMessage.trim()) return;

    // Create a temporary message ID
    const messageId = `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create the message object
    const message: Message = {
      id: messageId,
      role: "user",
      content: userMessage,
    };

    // Show optimistic UI update
    setMessages([...messages, message]);

    // Send the message to the action
    setIsLoading(true);
    try {
      const updatedMessages = await sendMessage(formId, message);
      // Update with the authoritative message list from the server
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      // Revert to previous messages if there's an error
      setMessages([
        ...messages,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    handleSubmit,
  };
}

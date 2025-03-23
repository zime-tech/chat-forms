"use client";

import { Message } from "@ai-sdk/react";
import { useEffect, useState } from "react";

export type ChatOptions<TResponse> = {
  sendMessage: (messages: Message[]) => Promise<TResponse>;
  extractResponseText: (response: TResponse) => string;
  initialMessages?: Message[];
};

export function useChat<TResponse>({
  sendMessage,
  extractResponseText,
  initialMessages = [],
}: ChatOptions<TResponse>) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState<TResponse | null>(null);

  const addMessage = (
    message: Message["content"],
    role: "user" | "assistant"
  ) => {
    const newId = messages.length;
    const newMessages = [
      ...messages,
      { id: newId.toString(), role, content: message },
    ];
    setMessages(newMessages);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement;
    addMessage(input.value, "user");
    input.value = "";
  };

  useEffect(() => {
    const fetchResponse = async () => {
      setIsLoading(true);
      try {
        const data = await sendMessage(messages);
        setResponseData(data);
        addMessage(extractResponseText(data), "assistant");
      } catch (error) {
        console.error("Error fetching response:", error);
        addMessage(
          "Sorry, there was an error processing your request.",
          "assistant"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === "user" &&
      !isLoading
    ) {
      fetchResponse();
    }
  }, [messages, isLoading, sendMessage, extractResponseText]);

  return {
    messages,
    isLoading,
    handleSubmit,
    addMessage,
    responseData,
  };
}

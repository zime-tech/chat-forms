"use client";

import { FormResponse, sendMessage } from "@/actions/form-manager";
import { useChat } from "@/hooks/use-chat";

export default function Chat() {
  const { messages, isLoading, handleSubmit, responseData } =
    useChat<FormResponse>({
      sendMessage,
      extractResponseText: (data) => data.responseToUser,
      initialMessages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Let's start creating the form. Give me an idea of what is form created for?",
        },
      ],
    });

  // Find the last assistant message index
  const lastAssistantMessageIndex = [...messages]
    .reverse()
    .findIndex((m) => m.role === "assistant");

  // Adjust the index to the original array's index
  const lastAssistantIndex =
    lastAssistantMessageIndex !== -1
      ? messages.length - 1 - lastAssistantMessageIndex
      : -1;

  return (
    <div className="flex flex-col w-full max-w-md py-8 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-6">Form Builder Chat</h1>

      {messages?.map((m, index) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <div className="font-bold">
            {m.role === "user" ? "User: " : "AI: "}
          </div>
          <div>{m.content}</div>

          {m.role === "assistant" &&
            responseData?.formSettingsUpdated &&
            index === lastAssistantIndex &&
            responseData?.formSettings && (
              <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                <div>
                  <strong>Form Settings:</strong>
                </div>
                <div>Title: {responseData.formSettings.title}</div>
                <div>Tone: {responseData.formSettings.tone}</div>
                <div>
                  Journey: {responseData.formSettings.journey.join(", ")}
                </div>
                <div>
                  About Business: {responseData.formSettings.aboutBusiness}
                </div>
                <div>
                  Welcome Message: {responseData.formSettings.welcomeMessage}
                </div>
                <div>
                  Call To Action: {responseData.formSettings.callToAction}
                </div>
                <div>
                  End Screen Message:{" "}
                  {responseData.formSettings.endScreenMessage}
                </div>
              </div>
            )}
        </div>
      ))}

      {isLoading && <div className="text-gray-400">AI is thinking...</div>}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl"
      >
        <input
          className="w-full p-2"
          placeholder="Describe a form you need..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}

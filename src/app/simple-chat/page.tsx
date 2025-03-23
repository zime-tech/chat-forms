"use client";

import { SimpleChatResponse, sendSimpleMessage } from "@/actions/simple-chat";
import { useChat } from "@/hooks/use-chat";

export default function SimpleChat() {
  const { messages, isLoading, handleSubmit, responseData } =
    useChat<SimpleChatResponse>({
      sendMessage: sendSimpleMessage,
      extractResponseText: (data) => data.message,
    });

  return (
    <div className="flex flex-col w-full max-w-md py-8 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-6">
        Simple Chat with Sentiment Analysis
      </h1>

      {messages?.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <div className="font-bold">
            {m.role === "user" ? "User: " : "AI: "}
          </div>
          <div>{m.content}</div>
        </div>
      ))}

      {isLoading && <div className="text-gray-400">AI is thinking...</div>}

      {responseData && (
        <div className="mt-6 p-4 border rounded shadow-sm bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Response Analysis</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Sentiment:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  responseData.sentiment === "positive"
                    ? "bg-green-100 text-green-800"
                    : responseData.sentiment === "negative"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {responseData.sentiment}
              </span>
            </div>
            <div>
              <span className="font-medium">Topics:</span>{" "}
              <div className="flex flex-wrap gap-1 mt-1">
                {responseData.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(responseData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl"
      >
        <input
          className="w-full p-2"
          placeholder="Type a message..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}

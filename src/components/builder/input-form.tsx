"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

interface InputFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(e);
      setInputValue("");
    }
  };

  return (
    <div className="p-6 backdrop-blur-md bg-black/30 border-t border-white/10 z-10">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
        <div className="relative">
          <input
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/40 text-white"
            placeholder="Describe a form you need..."
            disabled={isLoading}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white disabled:opacity-50 transition-all hover:shadow-md hover:shadow-purple-500/20"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>

        {isLoading && (
          <div className="absolute -top-10 left-0 right-0 text-center text-white/60 flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </form>
    </div>
  );
}

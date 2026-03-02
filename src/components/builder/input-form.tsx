"use client";

import { Send, Loader2 } from "lucide-react";
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
    <div className="border-t border-border bg-surface p-3 shrink-0">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl relative">
        <input
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          placeholder="Describe a form you need..."
          disabled={isLoading}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send message"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground disabled:opacity-30 transition-opacity"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Send size={13} />
          )}
        </button>
      </form>
    </div>
  );
}

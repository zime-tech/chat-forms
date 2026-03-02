import { MessageSquareText, Loader2 } from "lucide-react";

export default function FormLoading() {
  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      <header className="flex h-14 items-center border-b border-border bg-surface px-6 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-accent" />
          <span className="font-semibold text-foreground">Chat Forms</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Loading form...</p>
      </div>
    </div>
  );
}

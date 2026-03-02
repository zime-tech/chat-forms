import { MessageSquareText, Lock } from "lucide-react";

export default function FormClosedPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      <header className="flex h-14 items-center border-b border-border bg-surface px-6 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-accent" />
          <span className="font-semibold text-foreground">Chat Forms</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock size={24} className="text-muted-foreground" />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <h1 className="text-xl font-semibold text-foreground">
            This form is no longer accepting responses
          </h1>
          <p className="text-sm text-muted-foreground">
            The form owner has closed this form or it has reached its response limit.
          </p>
        </div>
      </div>
    </div>
  );
}

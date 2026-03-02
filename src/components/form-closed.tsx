import { MessageSquareText, Lock, CheckCircle2 } from "lucide-react";
import type { FormClosedReason } from "@/db/storage";

const REASON_CONTENT: Record<
  FormClosedReason,
  { heading: string; body: string }
> = {
  closed: {
    heading: "This form is no longer accepting responses",
    body: "The form owner has closed this form. If you believe this is an error, please contact the person who shared it with you.",
  },
  scheduled: {
    heading: "This form is no longer accepting responses",
    body: "This form's submission window has ended. If you believe this is an error, please contact the person who shared it with you.",
  },
  max_responses: {
    heading: "This form has reached its response limit",
    body: "The maximum number of responses has been collected. Thank you for your interest — no further submissions are being accepted.",
  },
};

export default function FormClosedPage({
  title,
  reason = "closed",
}: {
  title: string;
  reason?: FormClosedReason;
}) {
  const { heading, body } = REASON_CONTENT[reason];
  const isMaxResponses = reason === "max_responses";

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
            {isMaxResponses ? (
              <CheckCircle2 size={24} className="text-muted-foreground" />
            ) : (
              <Lock size={24} className="text-muted-foreground" />
            )}
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <h1 className="text-xl font-semibold text-foreground">{heading}</h1>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </div>

      <footer className="border-t border-border bg-surface px-6 py-3 text-center shrink-0">
        <p className="text-[10px] text-muted-foreground">
          Powered by{" "}
          <a href="/" className="font-medium text-accent hover:underline">
            Chat Forms
          </a>
        </p>
      </footer>
    </div>
  );
}

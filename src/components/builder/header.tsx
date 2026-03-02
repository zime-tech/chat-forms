"use client";

import { ArrowLeft, Link as LinkIcon, Check, Copy, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  formId: string;
  formTitle?: string;
  createdAt?: string;
  isClosed?: boolean;
  handleCopyLink: () => void;
  copied: boolean;
}

export default function Header({
  formId,
  formTitle,
  createdAt,
  isClosed,
  handleCopyLink,
  copied,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-surface px-4 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Back to dashboard"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-none">
          {formTitle || "Form Builder"}
        </span>
        {isClosed && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
            <Lock size={9} />
            Closed
          </span>
        )}
        {!isClosed && createdAt && (
          <span className="hidden sm:inline text-xs text-muted-foreground">
            Created {new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy link
            </>
          )}
        </button>
        <a
          href={`/forms/${formId}`}
          target="_blank"
          rel="noopener noreferrer"
          title={isClosed ? "This form is currently closed" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity ${
            isClosed
              ? "bg-muted text-muted-foreground hover:opacity-80"
              : "bg-accent text-accent-foreground hover:opacity-90"
          }`}
        >
          {isClosed ? <Lock size={12} /> : <LinkIcon size={12} />}
          {isClosed ? "Form closed" : "Open form"}
        </a>
      </div>
    </header>
  );
}

"use client";

import { ArrowLeft, Link as LinkIcon, Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  formId: string;
  formTitle?: string;
  createdAt?: string;
  handleCopyLink: () => void;
  copied: boolean;
}

export default function Header({
  formId,
  formTitle,
  createdAt,
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
        <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
          {formTitle || "Form Builder"}
        </span>
        {createdAt && (
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
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          <LinkIcon size={12} />
          Open form
        </a>
      </div>
    </header>
  );
}

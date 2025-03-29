"use client";

import { useState } from "react";
import { useConsent } from "./consent-provider";
import { X } from "lucide-react";

export default function ConsentBanner() {
  const { status, acceptConsent, rejectConsent } = useConsent();
  const [expanded, setExpanded] = useState(false);

  // Don't show banner if user has already made a choice
  if (status !== "pending") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 z-50 p-4 animate-slideIn">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Cookie Consent
        </h3>
        <button
          onClick={() => rejectConsent()}
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
        We use cookies to enhance your browsing experience, analyze site
        traffic, and personalize content.
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-blue-600 dark:text-blue-400 ml-1 underline underline-offset-2"
          >
            Learn more
          </button>
        )}
      </p>

      {expanded && (
        <div className="mb-3 text-xs text-zinc-600 dark:text-zinc-400 border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 mt-2">
          <p className="mb-2">
            <strong>Analytics cookies</strong> help us understand how visitors
            interact with our website. This information is used to improve your
            experience and our services.
          </p>
          <p>
            We use Jitsu to collect anonymous usage statistics that help us
            improve our website. These cookies track information such as how you
            found our site and which pages you visited.
          </p>
          <p className="mt-2">
            You can change your preferences at any time by clicking the "Manage
            Cookies" link in the footer.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-end mt-2">
        <button
          onClick={() => rejectConsent()}
          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
        >
          Reject All
        </button>
        <button
          onClick={() => acceptConsent()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-md transition-colors"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useConsent } from "./consent-provider";
import { X, Info } from "lucide-react";

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookieSettings({
  isOpen,
  onClose,
}: CookieSettingsProps) {
  const { status, acceptConsent, rejectConsent } = useConsent();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    status === "accepted"
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (analyticsEnabled) {
      acceptConsent();
    } else {
      rejectConsent();
    }
    onClose();
  };

  const handleCancel = () => {
    // Reset the UI state to match actual consent state
    setAnalyticsEnabled(status === "accepted");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Cookie Settings
          </h2>
          <button
            onClick={handleCancel}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">
            Manage your cookie preferences. You can enable or disable different
            types of cookies below.
          </p>

          <div className="space-y-4">
            {/* Essential cookies - always on */}
            <div className="flex items-start gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Essential Cookies
                  </span>
                  <div
                    className="ml-2 text-zinc-500 dark:text-zinc-400 cursor-help"
                    title="These cookies are necessary for the website to function and cannot be switched off"
                  >
                    <Info size={14} />
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  These cookies are necessary for the website to function and
                  cannot be switched off.
                </p>
              </div>
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* Analytics cookies - can toggle */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    Analytics Cookies
                  </span>
                  <div
                    className="ml-2 text-zinc-500 dark:text-zinc-400 cursor-help"
                    title="These cookies help us improve our website by collecting and reporting information on how you use it"
                  >
                    <Info size={14} />
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  These cookies help us understand how visitors interact with
                  our website, which allows us to improve your experience.
                </p>
              </div>
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-md transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

// Export a button component to open the settings modal
export function CookieSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2"
    >
      Manage Cookies
    </button>
  );
}

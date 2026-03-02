"use client";

import { Message } from "@ai-sdk/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, Settings, BarChart3, LineChart, Eye, X, Share2 } from "lucide-react";
import FormBuilderChat from "./builder/form-builder-chat";
import Header from "./builder/header";
import { useFormSettings } from "@/hooks/use-form-settings";
import FormSettingsPanel from "./settings/form-setting-panel";
import { FormSettings } from "./builder/types";
import { Toaster } from "sonner";
import FormAssistantClient from "./form-assistant-client";
import { createFormSessionAction } from "@/actions/form-assistant";
import FormResultsPanel from "./results/form-results-panel";
import FormSummaryPanel from "./results/form-summary-panel";
import FormSharingPanel from "./sharing/form-sharing-panel";

interface FormBuilderProps {
  formId: string;
  initialMessages?: Message[];
}

const tabs = [
  { id: "chat" as const, label: "Chat", icon: MessageCircle },
  { id: "settings" as const, label: "Settings", icon: Settings },
  { id: "results" as const, label: "Results", icon: BarChart3 },
  { id: "overall-summary" as const, label: "Summary", icon: LineChart },
  { id: "share" as const, label: "Share", icon: Share2 },
];

export default function FormBuilder({
  formId,
  initialMessages,
}: FormBuilderProps) {
  const getInitialTab = (): "chat" | "settings" | "results" | "overall-summary" | "share" => {
    if (typeof window === "undefined") return "chat";
    const hash = window.location.hash.replace("#", "");
    const valid = ["chat", "settings", "results", "overall-summary", "share"];
    return valid.includes(hash) ? (hash as typeof activeTab) : "chat";
  };

  const [activeTab, setActiveTab] = useState<
    "chat" | "settings" | "results" | "overall-summary" | "share"
  >(getInitialTab);
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: "initial-message",
        role: "assistant",
        content:
          "Let's start creating the form. Give me an idea of what is form created for?",
      },
    ]
  );
  const [formAssistantSessionId, setFormAssistantSessionId] = useState<string | null>(null);

  const resetSession = useCallback(() => {
    createFormSessionAction(formId).then((newSession) => {
      setFormAssistantSessionId(newSession.id);
    });
  }, [formId]);

  const {
    formSettings,
    lastFormUpdateMessageId,
    updateFormSettings,
    formSettingsUpdated,
    setFormSettingsUpdated,
  } = useFormSettings(messages, formId);

  // Create a preview session only when form settings first become available
  useEffect(() => {
    if (formSettings && !formAssistantSessionId) {
      resetSession();
    }
  }, [formSettings, formAssistantSessionId, resetSession]);

  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  };

  // Warn before leaving with unsaved settings
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedSettings) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedSettings]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/forms/${formId}`);
    setCopied(true);
  };

  const handleMessagesUpdate = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const onResetClick = () => {
    setShowResetConfirm(true);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setShowResetConfirm(false), 5000);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setFormAssistantSessionId(null);
    setTimeout(() => resetSession(), 10);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toaster position="top-right" richColors closeButton />

      <Header
        formId={formId}
        formTitle={formSettings?.title}
        handleCopyLink={handleCopyLink}
        copied={copied}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left panel — full width on mobile, side panel on desktop */}
        <div className={`flex flex-col border-r border-border overflow-hidden transition-all duration-200 w-full ${activeTab === "results" ? "md:w-[55%]" : "md:w-[45%]"}`}>
          {/* Tabs */}
          <div className="flex border-b border-border bg-surface shrink-0" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.id === "settings" && !formSettings}
                title={tab.id === "settings" && !formSettings ? "Chat with the AI to generate form settings first" : undefined}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}

            {/* Mobile preview toggle */}
            {formAssistantSessionId && formSettings && (
              <button
                onClick={() => setShowMobilePreview(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors md:hidden"
              >
                <Eye size={14} />
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 relative overflow-hidden">
            <div role="tabpanel" id="panel-chat" className={`absolute inset-0 ${activeTab === "chat" ? "z-10 visible" : "z-0 invisible"}`}>
              <FormBuilderChat
                formId={formId}
                initialMessages={initialMessages}
                formSettings={formSettings}
                lastFormUpdateMessageId={lastFormUpdateMessageId}
                formSettingsUpdated={formSettingsUpdated}
                setFormSettingsUpdated={setFormSettingsUpdated}
                onMessagesUpdate={handleMessagesUpdate}
                onDetailedView={() => handleTabChange("settings")}
              />
            </div>

            <div role="tabpanel" id="panel-settings" className={`absolute inset-0 ${activeTab === "settings" ? "z-10 visible" : "z-0 invisible"}`}>
              {formSettings ? (
                <FormSettingsPanel
                  formId={formId}
                  formSettings={formSettings}
                  onSettingsUpdate={(newSettings: FormSettings) =>
                    updateFormSettings(newSettings, "manual-update")
                  }
                  onHasChanges={setHasUnsavedSettings}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Chat with the AI to generate form settings first.
                </div>
              )}
            </div>

            <div role="tabpanel" id="panel-results" className={`absolute inset-0 ${activeTab === "results" ? "z-10 visible" : "z-0 invisible"}`}>
              <FormResultsPanel formId={formId} />
            </div>

            <div role="tabpanel" id="panel-overall-summary" className={`absolute inset-0 ${activeTab === "overall-summary" ? "z-10 visible" : "z-0 invisible"}`}>
              <FormSummaryPanel formId={formId} />
            </div>

            <div role="tabpanel" id="panel-share" className={`absolute inset-0 ${activeTab === "share" ? "z-10 visible" : "z-0 invisible"}`}>
              <FormSharingPanel formId={formId} />
            </div>
          </div>
        </div>

        {/* Right panel - form preview (hidden on mobile, shown as overlay) */}
        <div className={`hidden md:block overflow-hidden relative transition-all duration-200 ${activeTab === "results" ? "w-[45%]" : "w-[55%]"}`}>
          {formAssistantSessionId && formSettings && (
            <div className="absolute top-3 right-3 z-20">
              {showResetConfirm ? (
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs">
                  <span className="text-muted-foreground">Reset?</span>
                  <button
                    onClick={confirmReset}
                    className="rounded px-1.5 py-0.5 font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={cancelReset}
                    className="rounded px-1.5 py-0.5 font-medium text-muted-foreground hover:bg-surface-hover transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={onResetClick}
                  className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  Reset preview
                </button>
              )}
            </div>
          )}
          {formAssistantSessionId && formSettings ? (
            <FormAssistantClient
              sessionId={formAssistantSessionId}
              formId={formId}
              formSettings={formSettings}
              hideHeader
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Form preview will appear here once settings are generated.
            </div>
          )}
        </div>

        {/* Mobile preview overlay */}
        {showMobilePreview && (
          <div className="absolute inset-0 z-30 bg-background md:hidden">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 shrink-0">
              <span className="text-xs font-medium text-foreground">Form Preview</span>
              <div className="flex items-center gap-2">
                {showResetConfirm ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Reset?</span>
                    <button
                      onClick={confirmReset}
                      className="rounded px-1.5 py-0.5 font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={cancelReset}
                      className="rounded px-1.5 py-0.5 font-medium text-muted-foreground hover:bg-surface-hover transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onResetClick}
                    className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowMobilePreview(false)}
                  aria-label="Close preview"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-41px)]">
              {formAssistantSessionId && formSettings ? (
                <FormAssistantClient
                  sessionId={formAssistantSessionId}
                  formId={formId}
                  formSettings={formSettings}
                  hideHeader
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Form preview will appear here once settings are generated.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

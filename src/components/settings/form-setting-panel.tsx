import { FormSettings } from "@/components/builder/types";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Type,
  Clock,
  MessageCircle,
  Users,
  Briefcase,
  Hand,
  Send,
  CheckCircle,
  ListOrdered,
  Loader2,
  Shield,
  CalendarClock,
  Hash,
  Webhook,
  Palette,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

const PRESET_COLORS = [
  { value: "#4f46e5", label: "Indigo" },
  { value: "#0ea5e9", label: "Sky" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Orange" },
  { value: "#1e293b", label: "Slate" },
];

interface FormSettingsPanelProps {
  formId: string;
  formSettings: FormSettings;
  onSettingsUpdate: (settings: FormSettings) => void;
  onHasChanges?: (hasChanges: boolean) => void;
}

export default function FormSettingsPanel({
  formId,
  formSettings,
  onSettingsUpdate,
  onHasChanges,
}: FormSettingsPanelProps) {
  const [settings, setSettings] = useState<FormSettings>(formSettings);
  const [originalSettings, setOriginalSettings] =
    useState<FormSettings>(formSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSettings(formSettings);
    setOriginalSettings(formSettings);
  }, [formSettings]);

  useEffect(() => {
    const hasUnsavedChanges =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasUnsavedChanges);
    onHasChanges?.(hasUnsavedChanges);
  }, [settings, originalSettings, onHasChanges]);

  const handleInputChange = (
    field: keyof FormSettings,
    value: string | string[] | number | Date | null
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeyInformationItemChange = (index: number, value: string) => {
    const updatedKeyInformation = [...settings.keyInformation];
    updatedKeyInformation[index] = value;
    handleInputChange("keyInformation", updatedKeyInformation);
  };

  const handleRemoveKeyInformationItem = (index: number) => {
    const updatedKeyInformation = [...settings.keyInformation];
    updatedKeyInformation.splice(index, 1);
    handleInputChange("keyInformation", updatedKeyInformation);
  };

  const validateSettings = (): string | null => {
    if (!settings.title.trim()) {
      return "Form title is required.";
    }
    if (settings.webhookUrl) {
      try {
        new URL(settings.webhookUrl);
      } catch {
        return "Webhook URL must be a valid URL (e.g., https://example.com/webhook).";
      }
    }
    if (settings.maxResponses !== null && settings.maxResponses !== undefined) {
      if (settings.maxResponses < 1) {
        return "Max responses must be at least 1.";
      }
    }
    return null;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateSettings();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Clean up empty key information items before saving
    const cleanedSettings = {
      ...settings,
      keyInformation: settings.keyInformation.filter((item) => item.trim() !== ""),
    };

    setIsSaving(true);

    try {
      onSettingsUpdate(cleanedSettings);
      setSettings(cleanedSettings);
      setOriginalSettings(cleanedSettings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSettingsUpdate, validateSettings]);

  // Cmd+S / Ctrl+S keyboard shortcut to save settings
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && hasChanges && !isSaving) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [hasChanges, isSaving]);

  const handleDiscardChanges = () => {
    setSettings(originalSettings);
    toast("Changes discarded", {
      description: "Your changes have been reset to the last saved version.",
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl p-6 pb-28">
        <header className="mb-6">
          <h1 className="text-lg font-semibold text-foreground">
            Form Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your form&apos;s appearance and behavior
          </p>
        </header>

        {hasChanges && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            <AlertTriangle size={16} className="shrink-0" />
            <span>You have unsaved changes.</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Type size={16} className="text-muted-foreground" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <FieldGroup label="Form Title" icon={Type}>
                <input
                  type="text"
                  maxLength={100}
                  value={settings.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Enter form title"
                />
              </FieldGroup>

              <FieldGroup label="Completion Time" icon={Clock}>
                <input
                  type="text"
                  maxLength={30}
                  value={settings.expectedCompletionTime}
                  onChange={(e) =>
                    handleInputChange("expectedCompletionTime", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="e.g., 2-3 minutes"
                />
              </FieldGroup>
            </div>
          </section>

          {/* Content & Tone */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageCircle size={16} className="text-muted-foreground" />
              Content & Tone
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label="Tone" icon={MessageCircle}>
                  <input
                    type="text"
                    maxLength={50}
                    value={settings.tone}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                    placeholder="e.g., Friendly, Professional"
                  />
                </FieldGroup>

                <FieldGroup label="Persona" icon={Users}>
                  <input
                    type="text"
                    maxLength={100}
                    value={settings.persona}
                    onChange={(e) =>
                      handleInputChange("persona", e.target.value)
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                    placeholder="e.g., Support Agent"
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Target Audience" icon={Users}>
                <textarea
                  maxLength={500}
                  value={settings.targetAudience}
                  onChange={(e) =>
                    handleInputChange("targetAudience", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Describe your target audience"
                />
                <CharCount value={settings.targetAudience} max={500} />
              </FieldGroup>

              <FieldGroup label="About Business" icon={Briefcase}>
                <textarea
                  maxLength={500}
                  value={settings.aboutBusiness}
                  onChange={(e) =>
                    handleInputChange("aboutBusiness", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Tell us about your business"
                />
                <CharCount value={settings.aboutBusiness} max={500} />
              </FieldGroup>
            </div>
          </section>

          {/* Messages */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Send size={16} className="text-muted-foreground" />
              Form Messages
            </h2>

            <div className="space-y-4">
              <FieldGroup label="Welcome Message" icon={Hand}>
                <textarea
                  maxLength={500}
                  value={settings.welcomeMessage}
                  onChange={(e) =>
                    handleInputChange("welcomeMessage", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Message shown at the start"
                />
                <CharCount value={settings.welcomeMessage} max={500} />
              </FieldGroup>

              <FieldGroup label="Call To Action" icon={Send}>
                <input
                  type="text"
                  maxLength={50}
                  value={settings.callToAction}
                  onChange={(e) =>
                    handleInputChange("callToAction", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="e.g., Submit, Get Started"
                />
              </FieldGroup>

              <FieldGroup label="End Screen Message" icon={CheckCircle}>
                <textarea
                  maxLength={500}
                  value={settings.endScreenMessage}
                  onChange={(e) =>
                    handleInputChange("endScreenMessage", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Message shown after completing the form"
                />
                <CharCount value={settings.endScreenMessage} max={500} />
              </FieldGroup>
            </div>
          </section>

          {/* Key Information */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ListOrdered size={16} className="text-muted-foreground" />
                Key Information
              </h2>
              <button
                type="button"
                onClick={() => {
                  handleInputChange("keyInformation", [
                    ...settings.keyInformation,
                    "",
                  ]);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {settings.keyInformation?.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No key information items yet. Add items to guide users through
                  your form.
                </p>
              ) : (
                settings.keyInformation?.map((step, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 rounded-md border border-border bg-background"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border-r border-border text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) =>
                        handleKeyInformationItemChange(index, e.target.value)
                      }
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder={`Item ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyInformationItem(index)}
                      className="mr-1 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Branding */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Palette size={16} className="text-muted-foreground" />
              Branding
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Palette size={14} />
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange("accentColor", color.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      settings.accentColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    aria-label={`Set accent color to ${color.label}`}
                  />
                ))}
                <label
                  className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                    settings.accentColor && !PRESET_COLORS.some((c) => c.value === settings.accentColor)
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{
                    background:
                      settings.accentColor && !PRESET_COLORS.some((c) => c.value === settings.accentColor)
                        ? settings.accentColor
                        : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                  }}
                  title="Custom color"
                  aria-label="Pick custom accent color"
                >
                  <input
                    type="color"
                    value={settings.accentColor || "#4f46e5"}
                    onChange={(e) => handleInputChange("accentColor", e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
              {settings.accentColor && (
                <button
                  type="button"
                  onClick={() => handleInputChange("accentColor", null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset to default
                </button>
              )}
            </div>
          </section>

          {/* Form Status & Limits */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield size={16} className="text-muted-foreground" />
              Form Status & Limits
            </h2>

            <div className="space-y-4">
              <FieldGroup label="Status" icon={Shield}>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange("status", "active")}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      settings.status !== "closed"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:bg-surface-hover"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("status", "closed")}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      settings.status === "closed"
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border text-muted-foreground hover:bg-surface-hover"
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </FieldGroup>

              <FieldGroup label="Auto-close Date" icon={CalendarClock}>
                <input
                  type="datetime-local"
                  value={
                    settings.closedAt
                      ? (() => {
                          const d = new Date(settings.closedAt);
                          const offset = d.getTimezoneOffset();
                          const local = new Date(d.getTime() - offset * 60000);
                          return local.toISOString().slice(0, 16);
                        })()
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "closedAt",
                      e.target.value ? new Date(e.target.value) : null
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                />
                {settings.closedAt && (
                  <button
                    type="button"
                    onClick={() => handleInputChange("closedAt", null)}
                    className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear date
                  </button>
                )}
              </FieldGroup>

              <FieldGroup label="Max Responses" icon={Hash}>
                <input
                  type="number"
                  min={1}
                  value={settings.maxResponses ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maxResponses",
                      e.target.value ? parseInt(e.target.value, 10) : null
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Unlimited"
                />
                {settings.maxResponses && (
                  <button
                    type="button"
                    onClick={() => handleInputChange("maxResponses", null)}
                    className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Remove limit
                  </button>
                )}
              </FieldGroup>

              <FieldGroup label="Webhook URL" icon={Webhook}>
                <input
                  type="url"
                  value={settings.webhookUrl ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "webhookUrl",
                      e.target.value || null
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="https://example.com/webhook"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Receive a POST request with response data when a form is completed.
                </p>
              </FieldGroup>

              <FieldGroup label="Email Notifications" icon={Bell}>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange("emailNotifications", "on")}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      settings.emailNotifications === "on"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:bg-surface-hover"
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("emailNotifications", "off")}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      settings.emailNotifications !== "on"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:bg-surface-hover"
                    }`}
                  >
                    Off
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Get an email when someone completes your form.
                </p>
              </FieldGroup>
            </div>
          </section>

          {/* Save/Cancel Buttons */}
          <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-border bg-background px-6 py-4">
            <div className="flex gap-3">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors"
                >
                  Discard
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon size={14} />
        {label}
      </label>
      {children}
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value?.length ?? 0;
  if (len === 0) return null;
  return (
    <p className={`text-right text-[10px] ${len >= max ? "text-destructive" : "text-muted-foreground"}`}>
      {len}/{max}
    </p>
  );
}

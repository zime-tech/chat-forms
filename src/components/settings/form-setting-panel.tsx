import { FormSettings } from "@/components/builder/types";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface FormSettingsPanelProps {
  formId: string;
  formSettings: FormSettings;
  onSettingsUpdate: (settings: FormSettings) => void;
}

export default function FormSettingsPanel({
  formId,
  formSettings,
  onSettingsUpdate,
}: FormSettingsPanelProps) {
  const [settings, setSettings] = useState<FormSettings>(formSettings);
  const [originalSettings, setOriginalSettings] =
    useState<FormSettings>(formSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(formSettings);
    setOriginalSettings(formSettings);
  }, [formSettings]);

  useEffect(() => {
    const hasUnsavedChanges =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasUnsavedChanges);
  }, [settings, originalSettings]);

  const handleInputChange = (
    field: keyof FormSettings,
    value: string | string[]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      onSettingsUpdate(settings);
      setOriginalSettings(settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={settings.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Enter form title"
                />
              </FieldGroup>

              <FieldGroup label="Completion Time" icon={Clock}>
                <input
                  type="text"
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
                    value={settings.tone}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                    placeholder="e.g., Friendly, Professional"
                  />
                </FieldGroup>

                <FieldGroup label="Persona" icon={Users}>
                  <input
                    type="text"
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
                  value={settings.targetAudience}
                  onChange={(e) =>
                    handleInputChange("targetAudience", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Describe your target audience"
                />
              </FieldGroup>

              <FieldGroup label="About Business" icon={Briefcase}>
                <textarea
                  value={settings.aboutBusiness}
                  onChange={(e) =>
                    handleInputChange("aboutBusiness", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Tell us about your business"
                />
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
                  value={settings.welcomeMessage}
                  onChange={(e) =>
                    handleInputChange("welcomeMessage", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Message shown at the start"
                />
              </FieldGroup>

              <FieldGroup label="Call To Action" icon={Send}>
                <input
                  type="text"
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
                  value={settings.endScreenMessage}
                  onChange={(e) =>
                    handleInputChange("endScreenMessage", e.target.value)
                  }
                  className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Message shown after completing the form"
                />
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

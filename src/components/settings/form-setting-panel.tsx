import { FormSettings } from "@/components/builder/types";
import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Type,
  Clock,
  MessageCircle,
  Users,
  Briefcase,
  Hand,
  Send,
  CheckCircle,
  ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import BackgroundEffects from "../builder/background-effects";

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

  // Update settings when props change
  useEffect(() => {
    setSettings(formSettings);
    setOriginalSettings(formSettings);
  }, [formSettings]);

  // Check for changes
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
    <div className="relative h-full bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Background Effects - lowest z-index */}
      <div className="absolute inset-0 z-0">
        <BackgroundEffects />
      </div>

      {/* Content - Ensure its z-index is appropriate */}
      <div className="relative z-[5] h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto p-6 pb-28">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Form Settings
            </h1>
            <p className="text-gray-400 flex items-center">
              <Info size={16} className="mr-2 text-purple-400" />
              Customize your form's appearance and behavior
            </p>
          </header>

          {hasChanges && (
            <div className="bg-amber-900/40 border border-amber-700/50 text-amber-200 px-4 py-3 rounded-md mb-6 flex items-center shadow-md">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
              <span>
                You have unsaved changes. Save or discard them before leaving
                this page.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section className="relative space-y-4 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 flex items-center">
                <Type size={20} className="mr-2 text-purple-400" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Type
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter form title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Clock
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Completion Time
                  </label>
                  <input
                    type="text"
                    value={settings.expectedCompletionTime}
                    onChange={(e) =>
                      handleInputChange(
                        "expectedCompletionTime",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 2-3 minutes"
                  />
                </div>
              </div>
            </section>

            {/* Content & Tone */}
            <section className="relative space-y-4 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 flex items-center">
                <MessageCircle size={20} className="mr-2 text-purple-400" />
                Content & Tone
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <MessageCircle
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Tone
                  </label>
                  <input
                    type="text"
                    value={settings.tone}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Friendly, Professional, Casual"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Users
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Persona
                  </label>
                  <input
                    type="text"
                    value={settings.persona}
                    onChange={(e) =>
                      handleInputChange("persona", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Sales Rep, Support Agent, Consultant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Users
                    size={16}
                    className="mr-2 text-purple-400 opacity-70"
                  />
                  Target Audience
                </label>
                <textarea
                  value={settings.targetAudience}
                  onChange={(e) =>
                    handleInputChange("targetAudience", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-24 resize-y"
                  placeholder="Describe your target audience"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                  <Briefcase
                    size={16}
                    className="mr-2 text-purple-400 opacity-70"
                  />
                  About Business
                </label>
                <textarea
                  value={settings.aboutBusiness}
                  onChange={(e) =>
                    handleInputChange("aboutBusiness", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-24 resize-y"
                  placeholder="Tell us about your business or organization"
                />
              </div>
            </section>

            {/* Messages */}
            <section className="relative space-y-4 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 flex items-center">
                <MessageCircle size={20} className="mr-2 text-purple-400" />
                Form Messages
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Hand
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Welcome Message
                  </label>
                  <textarea
                    value={settings.welcomeMessage}
                    onChange={(e) =>
                      handleInputChange("welcomeMessage", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-20 resize-y"
                    placeholder="Message shown at the start of the form"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <Send
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Call To Action
                  </label>
                  <input
                    type="text"
                    value={settings.callToAction}
                    onChange={(e) =>
                      handleInputChange("callToAction", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Submit, Get Started, Continue"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <CheckCircle
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    End Screen Message
                  </label>
                  <textarea
                    value={settings.endScreenMessage}
                    onChange={(e) =>
                      handleInputChange("endScreenMessage", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-20 resize-y"
                    placeholder="Message shown to users after completing the form"
                  />
                </div>
              </div>
            </section>

            {/* Key Information */}
            <section className="relative space-y-4 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 flex items-center">
                <ListOrdered size={20} className="mr-2 text-purple-400" />
                Key Information
              </h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <ListOrdered
                      size={16}
                      className="mr-2 text-purple-400 opacity-70"
                    />
                    Key Information
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange("keyInformation", [
                        ...settings.keyInformation,
                        "",
                      ]);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors duration-200 shadow-md"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Key Information Item
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {settings.keyInformation?.length === 0 ? (
                    <div className="text-gray-400 italic text-sm py-2">
                      No key information steps added yet. Add steps to guide
                      users through your form.
                    </div>
                  ) : (
                    settings.keyInformation?.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-md overflow-hidden group"
                      >
                        <div className="bg-purple-900/50 p-2 text-white font-medium">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) =>
                            handleKeyInformationItemChange(
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-2 bg-transparent border-none text-white focus:ring-0 focus:outline-none"
                          placeholder={`Step ${index + 1} description`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyInformationItem(index)}
                          className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Save/Cancel Buttons */}
            <div className="sticky bottom-0 -mx-6 -mb-6 pt-3 px-6 pb-6 bg-gradient-to-t from-black to-transparent">
              <div className="flex gap-4">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    className="px-4 py-3 border border-white/10 rounded-md text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    Discard Changes
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving || !hasChanges}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-white font-medium transition-colors duration-200 shadow-lg ${
                    isSaving
                      ? "bg-purple-700 cursor-not-allowed"
                      : !hasChanges
                      ? "bg-purple-800/60 cursor-not-allowed text-white/70"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

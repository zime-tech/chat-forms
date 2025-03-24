"use client";

import {
  Sliders,
  ArrowRight,
  FileText,
  MessageCircle,
  User,
  Users,
  Award,
  CornerDownRight,
  Building,
  BellRing,
  Send,
  Clock,
} from "lucide-react";
import { FormSettings } from "./types";

interface FormSettingsDetailProps {
  formSettings: FormSettings;
  setShowPreview: (show: boolean) => void;
  showPreview: boolean;
}

export default function FormSettingsDetail({
  formSettings,
  setShowPreview,
  showPreview,
}: FormSettingsDetailProps) {
  return (
    <div
      className={`fixed inset-y-0 right-0 w-full max-w-md backdrop-blur-xl border-l transition-all duration-300 ease-in-out z-20
        ${
          showPreview
            ? "translate-x-0 shadow-2xl shadow-purple-900/20 bg-black/60 border-purple-500/20"
            : "translate-x-full bg-black/40 border-white/10"
        }`}
    >
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 animate-slideIn">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sliders size={20} className="text-purple-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Form Settings Detail
            </span>
          </h2>
          <button
            onClick={() => setShowPreview(false)}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 group"
          >
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Form Title */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "50ms" }}
          >
            <div className="flex items-center gap-2 text-purple-400 mb-2 text-sm font-medium">
              <FileText size={16} />
              TITLE
            </div>
            <h3 className="text-lg font-semibold">{formSettings.title}</h3>
          </div>

          {/* Tone */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center gap-2 text-blue-400 mb-2 text-sm font-medium">
              <MessageCircle size={16} />
              TONE
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-white text-sm">
                {formSettings.tone}
              </span>
            </div>
          </div>

          {/* Persona */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "125ms" }}
          >
            <div className="flex items-center gap-2 text-emerald-400 mb-2 text-sm font-medium">
              <User size={16} />
              PERSONA
            </div>
            <p className="text-white/80">{formSettings.persona}</p>
          </div>

          {/* Target Audience */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-2 text-amber-400 mb-2 text-sm font-medium">
              <Users size={16} />
              TARGET AUDIENCE
            </div>
            <p className="text-white/80">{formSettings.targetAudience}</p>
          </div>

          {/* Key Information */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "175ms" }}
          >
            <div className="flex items-center gap-2 text-indigo-400 mb-2 text-sm font-medium">
              <Award size={16} />
              Key Information
            </div>
            <div className="flex flex-wrap gap-2">
              {formSettings.keyInformation.map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-white text-sm flex items-center">
                    {step}
                    {i < formSettings.keyInformation.length - 1 && (
                      <CornerDownRight
                        size={14}
                        className="ml-2 text-indigo-400"
                      />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About Business */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center gap-2 text-green-400 mb-2 text-sm font-medium">
              <Building size={16} />
              ABOUT BUSINESS
            </div>
            <p className="text-white/80">{formSettings.aboutBusiness}</p>
          </div>

          {/* Welcome Message */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center gap-2 text-cyan-400 mb-2 text-sm font-medium">
              <BellRing size={16} />
              WELCOME MESSAGE
            </div>
            <p className="text-white/80">{formSettings.welcomeMessage}</p>
          </div>

          {/* Call To Action */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-2 text-yellow-400 mb-2 text-sm font-medium">
              <Send size={16} />
              CALL TO ACTION
            </div>
            <p className="text-white/80">{formSettings.callToAction}</p>
          </div>

          {/* End Screen Message */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "350ms" }}
          >
            <div className="flex items-center gap-2 text-red-400 mb-2 text-sm font-medium">
              <MessageCircle size={16} />
              END SCREEN MESSAGE
            </div>
            <p className="text-white/80">{formSettings.endScreenMessage}</p>
          </div>

          {/* Expected Completion Time */}
          <div
            className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 animate-slideIn"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-2 text-pink-400 mb-2 text-sm font-medium">
              <Clock size={16} />
              EXPECTED COMPLETION TIME
            </div>
            <p className="text-white/80">
              {formSettings.expectedCompletionTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

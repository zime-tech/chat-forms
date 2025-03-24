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
  MessageSquare,
  Clock,
} from "lucide-react";
import { FormSettings } from "./types";

interface FormSettingsSummaryProps {
  formSettings: FormSettings;
  onDetailedView: () => void;
}

export default function FormSettingsSummary({
  formSettings,
  onDetailedView,
}: FormSettingsSummaryProps) {
  return (
    <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-white/5 to-purple-500/5 border border-white/10 backdrop-blur-sm animate-fadeIn relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-50"></div>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-medium">
            <Sliders size={14} className="animate-pulse" />
            FORM SETTINGS UPDATED
          </div>
          <button
            onClick={onDetailedView}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/5"
          >
            <span>Detailed View</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2 text-sm">
          {/* Title & Tone Row */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
              <FileText
                size={12}
                className="text-purple-400 mr-1.5 group-hover:text-purple-300 transition-colors"
              />
              <span className="text-white font-medium truncate text-xs">
                {formSettings.title}
              </span>
            </div>
            <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
              <MessageCircle
                size={12}
                className="text-blue-400 mr-1.5 group-hover:text-blue-300 transition-colors"
              />
              <span className="text-white/90 text-xs">{formSettings.tone}</span>
            </div>
          </div>

          {/* Persona & Target Audience Row */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
              <User
                size={12}
                className="text-emerald-400 mr-1.5 group-hover:text-emerald-300 transition-colors"
              />
              <span className="text-white/90 text-xs truncate">
                {formSettings.persona}
              </span>
            </div>
            <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
              <Users
                size={12}
                className="text-amber-400 mr-1.5 group-hover:text-amber-300 transition-colors"
              />
              <span className="text-white/90 text-xs truncate">
                {formSettings.targetAudience}
              </span>
            </div>
          </div>

          {/* Key Information Row */}
          <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
            <Award
              size={12}
              className="text-indigo-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-indigo-300 transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 flex-1">
              {formSettings.keyInformation.map((step: string, i: number) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-white/90 text-xs flex items-center"
                >
                  {step}
                  {i < formSettings.keyInformation.length - 1 && (
                    <CornerDownRight
                      size={8}
                      className="ml-1 text-indigo-400"
                    />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* About Business Row */}
            <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
              <Building
                size={12}
                className="text-green-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-green-300 transition-colors"
              />
              <p className="text-white/90 text-xs flex-1 line-clamp-2">
                {formSettings.aboutBusiness}
              </p>
            </div>

            {/* Welcome Message Row */}
            <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
              <BellRing
                size={12}
                className="text-cyan-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-cyan-300 transition-colors"
              />
              <p className="text-white/90 text-xs flex-1 line-clamp-2">
                {formSettings.welcomeMessage}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Call to Action Row */}
            <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
              <Send
                size={12}
                className="text-yellow-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-yellow-300 transition-colors"
              />
              <p className="text-white/90 text-xs flex-1 line-clamp-1">
                {formSettings.callToAction}
              </p>
            </div>

            {/* End Screen Message Row */}
            <div className="flex items-start bg-white/5 hover:bg-white/10 transition-all rounded-md p-2 group">
              <MessageSquare
                size={12}
                className="text-red-400 mr-1.5 mt-0.5 shrink-0 group-hover:text-red-300 transition-colors"
              />
              <p className="text-white/90 text-xs flex-1 line-clamp-1">
                {formSettings.endScreenMessage}
              </p>
            </div>
          </div>

          {/* Expected Completion Time */}
          <div className="flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-md px-2 py-1 group">
            <Clock
              size={12}
              className="text-pink-400 mr-1.5 group-hover:text-pink-300 transition-colors"
            />
            <span className="text-white/90 text-xs">
              {formSettings.expectedCompletionTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

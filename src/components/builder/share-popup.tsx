"use client";

import { Check, Copy, LinkIcon } from "lucide-react";

interface SharePopupProps {
  formId: string;
  handleCopyLink: () => void;
  copied: boolean;
}

export default function SharePopup({
  formId,
  handleCopyLink,
  copied,
}: SharePopupProps) {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg shadow-purple-900/20 p-4 z-[100] animate-fadeIn">
      <h3 className="text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
        <LinkIcon size={14} className="text-purple-400" />
        Form Link
      </h3>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 truncate">
          {`${window.location.origin}/forms/${formId}`}
        </div>
        <button
          onClick={handleCopyLink}
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
            copied
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="text-xs text-white/50 mt-2">
        Share this link with others to let them fill your form
      </p>
    </div>
  );
}

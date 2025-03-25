"use client";

import { MessageSquare, LinkIcon, FileText } from "lucide-react";
import SharePopup from "./share-popup";

interface HeaderProps {
  formId: string;
  showSharePopup: boolean;
  setShowSharePopup: (show: boolean) => void;
  handleCopyLink: () => void;
  copied: boolean;
}

export default function Header({
  formId,
  showSharePopup,
  setShowSharePopup,
  handleCopyLink,
  copied,
}: HeaderProps) {
  const handleShareClick = () => {
    setShowSharePopup(!showSharePopup);
  };

  return (
    <header className="p-6 backdrop-blur-md bg-black/30 border-b border-white/10 flex items-center z-[90] relative">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <MessageSquare size={18} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Form Builder
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white"
          >
            <LinkIcon size={14} />
            <span className="text-sm">Share</span>
          </button>

          {showSharePopup && (
            <SharePopup
              formId={formId}
              handleCopyLink={handleCopyLink}
              copied={copied}
            />
          )}
        </div>
      </div>
    </header>
  );
}

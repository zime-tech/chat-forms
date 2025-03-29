"use client";

import { useEffect, useState } from "react";
import { CookieSettingsButton } from "./cookie-settings";
import CookieSettings from "./cookie-settings";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const pathname = usePathname();
  const [showFotter, setShowFotter] = useState(true);

  useEffect(() => {
    // if the path isn't /dashboard/{id} then show the footer
    console.log(pathname);
    setShowFotter(
      !pathname.includes("/dashboard") || pathname === "/dashboard"
    );
  }, [pathname]);

  return (
    showFotter && (
      <footer className="z-10 w-full border-t border-zinc-800 mt-auto py-4 bg-black/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            © {new Date().getFullYear()} Chat Forms. All rights reserved.
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a
              href="#"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Terms of Service
            </a>
            <CookieSettingsButton onClick={() => setCookieSettingsOpen(true)} />
          </div>

          {/* Cookie Settings Modal */}
          <CookieSettings
            isOpen={cookieSettingsOpen}
            onClose={() => setCookieSettingsOpen(false)}
          />
        </div>
      </footer>
    )
  );
}

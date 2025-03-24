"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FileText, LogOut, LogIn } from "lucide-react";

// Client-side authentication status check
export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  if (pathname.includes("/forms")) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-16 backdrop-blur-md bg-black/30 border-r border-white/10 flex flex-col items-center py-6 z-50">
      <div className="flex-shrink-0">
        <Link href="/" className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
        </Link>
      </div>

      <div className="mt-auto">
        {isAuthenticated ? (
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/login");
            }}
            className="flex items-center justify-center h-10 w-10 rounded-full text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
            title="Sign out"
          >
            <LogOut size={20} className="text-purple-400" />
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center h-10 w-10 rounded-full text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
            title="Sign in"
          >
            <LogIn size={20} className="text-purple-400" />
          </Link>
        )}
      </div>
    </aside>
  );
}

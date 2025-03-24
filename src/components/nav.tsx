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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", protected: true },
    { href: "/forms", label: "Forms", protected: true },
  ];

  // Only show nav items based on authentication status
  const filteredNavItems = navItems.filter(
    (item) => !item.protected || (item.protected && isAuthenticated)
  );

  return (
    <nav className="backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Forms Chat
                </span>
              </Link>
            </div>
            <div className="ml-8 flex space-x-6">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-purple-500 text-white"
                        : "border-transparent text-gray-400 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="animate-pulse h-8 w-20 bg-white/5 rounded"></div>
            ) : isAuthenticated ? (
              <button
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push("/login");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
              >
                <LogOut size={16} className="text-purple-400" />
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
              >
                <LogIn size={16} className="text-purple-400" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { FormSettings } from "@/db/schema";
import { getUserForms } from "@/db/storage";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  PlusCircle,
  Clock,
  Copy,
  Pencil,
  User,
  FileText,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

export default function DashboardClientPage({
  forms,
}: {
  forms: FormSettings[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-6 backdrop-blur-md bg-black/30 border-b border-white/10 flex items-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Your Forms
          </h1>
        </div>

        <Link
          href="/dashboard/new"
          className="ml-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} className="text-purple-400" />
          <span>Create New Form</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              <div className="h-3 w-3 bg-indigo-500 rounded-full animate-pulse delay-300"></div>
              <span className="text-white/60 ml-2">Loading your forms...</span>
            </div>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <FileText size={32} className="text-purple-300" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">No forms created yet</h2>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Create your first form to start collecting responses from your
              users.
            </p>
            <Link
              href="/dashboard/new"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium inline-flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              <PlusCircle size={18} />
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/5 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold line-clamp-1 flex-1">
                      {form.title}
                    </h3>
                    <div className="flex items-center text-white/40 text-xs">
                      <Clock size={12} className="mr-1" />
                      {form.createdAt &&
                        formatDistanceToNow(new Date(form.createdAt), {
                          addSuffix: true,
                        })}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <MessageCircle size={12} className="text-blue-400" />
                      </div>
                      <span className="text-white/70 text-sm">{form.tone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <User size={12} className="text-green-400" />
                      </div>
                      <span className="text-white/70 text-sm line-clamp-1">
                        {form.persona}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Clock size={12} className="text-amber-400" />
                      </div>
                      <span className="text-white/70 text-sm">
                        {form.expectedCompletionTime}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/form?id=${form.id}`)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <MessageSquare size={16} className="text-purple-400" />
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/form?id=${form.id}`
                          );
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <Copy size={16} className="text-blue-400" />
                      </button>
                    </div>

                    <button
                      onClick={() => router.push(`/dashboard?edit=${form.id}`)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <Pencil size={16} className="text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

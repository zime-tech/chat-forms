import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "auth";
import { ArrowRight, MessageSquareText, Zap, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat Forms — AI-powered conversational forms",
  description:
    "Build interactive forms with AI. Your respondents chat naturally instead of filling out fields. Higher completion rates, richer data, better experience.",
  openGraph: {
    title: "Chat Forms — AI-powered conversational forms",
    description:
      "Build interactive forms with AI. Your respondents chat naturally instead of filling out fields.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat Forms — AI-powered conversational forms",
    description:
      "Build interactive forms with AI. Your respondents chat naturally instead of filling out fields.",
  },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
          <Zap size={14} />
          AI-powered conversational forms
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Forms that feel like
          <br />
          <span className="text-accent">conversations</span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Build interactive forms with AI. Your respondents chat naturally instead
          of filling out fields. Higher completion rates, richer data, better experience.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Get started free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 py-20 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <MessageSquareText size={20} className="text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Chat-based creation</h3>
            <p className="text-sm text-muted-foreground">
              Describe what you need and AI builds the form for you. Iterate
              through conversation, not drag-and-drop.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Zap size={20} className="text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Smart responses</h3>
            <p className="text-sm text-muted-foreground">
              AI guides respondents through your form with follow-up questions,
              dynamic branching, and a natural conversation flow.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <BarChart3 size={20} className="text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">AI-powered insights</h3>
            <p className="text-sm text-muted-foreground">
              Get summaries, sentiment analysis, and key takeaways from every
              form response automatically.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

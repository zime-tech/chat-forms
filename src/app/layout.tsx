import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/nav";
import { SessionProvider } from "@/components/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chat Forms – AI-Powered Conversational Forms",
    template: "%s | Chat Forms",
  },
  description:
    "Build interactive forms powered by AI. Respondents chat naturally instead of filling out fields. Higher completion rates, richer data.",
  openGraph: {
    type: "website",
    siteName: "Chat Forms",
    title: "Chat Forms – AI-Powered Conversational Forms",
    description:
      "Build interactive forms powered by AI. Respondents chat naturally instead of filling out fields.",
  },
  twitter: {
    card: "summary",
    title: "Chat Forms – AI-Powered Conversational Forms",
    description:
      "Build interactive forms powered by AI. Respondents chat naturally instead of filling out fields.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-background text-foreground">
        <SessionProvider session={session}>
          <Navigation />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

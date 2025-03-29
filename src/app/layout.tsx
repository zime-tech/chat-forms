import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/nav";
import { SessionProvider } from "@/components/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";
import { analytics } from "@/lib/firebase";
import JitsuWrapper from "@/components/jitsu-wrapper";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Form Builder",
  description: "Interactive forms with AI-powered responses",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  // initialize analytics
  analytics;

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <JitsuWrapper>
            <Navigation />
            {children}
          </JitsuWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}

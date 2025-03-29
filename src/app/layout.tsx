import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/nav";
import { SessionProvider } from "@/components/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";
import { analytics } from "@/lib/firebase";
import JitsuWrapper from "@/components/jitsu-wrapper";
import { ConsentProvider } from "@/components/consent-provider";
import ConsentBanner from "@/components/consent-banner";
import Footer from "@/components/footer";

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
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SessionProvider session={session}>
          <ConsentProvider>
            <JitsuWrapper>
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
              <ConsentBanner />
            </JitsuWrapper>
          </ConsentProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

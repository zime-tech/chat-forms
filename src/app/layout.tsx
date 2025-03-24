import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/nav";
import { SessionProvider } from "@/components/session-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";

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

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Navigation />
          <div>
            {" "}
            {/* Add padding to account for the fixed nav */}
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}

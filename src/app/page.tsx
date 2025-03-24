import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "auth";
import BackgroundEffects from "@/components/builder/background-effects";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <BackgroundEffects />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Form Builder
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Build interactive forms with AI-powered responses
          </p>
        </div>
        <div className="mt-8">
          <div className="bg-white/5 backdrop-blur-sm py-8 px-4 shadow-lg shadow-purple-500/5 border border-white/10 sm:rounded-lg sm:px-10">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-white/10 text-sm font-medium rounded-md text-purple-400 hover:text-purple-300 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

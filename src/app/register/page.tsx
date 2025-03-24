import RegisterForm from "./register-form";
import Link from "next/link";
import BackgroundEffects from "@/components/builder/background-effects";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <BackgroundEffects />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              sign in to your account
            </Link>
          </p>
        </div>
        <div className="mt-8">
          <div className="bg-white/5 backdrop-blur-sm py-8 px-4 shadow-lg shadow-purple-500/5 border border-white/10 sm:rounded-lg sm:px-10">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}

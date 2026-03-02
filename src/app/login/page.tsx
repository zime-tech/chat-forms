import type { Metadata } from "next";
import LoginForm from "./login-form";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

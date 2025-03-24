"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, AlertCircle } from "lucide-react";

// Registration schema for client-side validation
const registerSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

// Define the error state type
type FormErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  general?: string;
};

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Get form data
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate form data
    const validationResult = registerSchema.safeParse({
      name,
      email,
      password,
    });

    if (!validationResult.success) {
      setIsLoading(false);
      setErrors(validationResult.error.flatten().fieldErrors);
      return;
    }

    try {
      // Register the user through an API
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        if (registerData.error?.email) {
          setErrors({ email: [registerData.error.email] });
        } else {
          setErrors({ general: registerData.message || "Registration failed" });
        }
        setIsLoading(false);
        return;
      }

      // If registration was successful, sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setErrors({
          general:
            "Account created but unable to sign in. Please try signing in manually.",
        });
        setIsLoading(false);
        router.push("/login");
        return;
      }

      // Successful registration and login, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300 flex items-center"
        >
          <User size={16} className="mr-2 text-purple-400 opacity-70" />
          Full name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="block w-full rounded-md bg-gray-800/70 border border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white sm:text-sm p-2"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300 flex items-center"
        >
          <Mail size={16} className="mr-2 text-purple-400 opacity-70" />
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md bg-gray-800/70 border border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white sm:text-sm p-2"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300 flex items-center"
        >
          <Lock size={16} className="mr-2 text-purple-400 opacity-70" />
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="block w-full rounded-md bg-gray-800/70 border border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white sm:text-sm p-2"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-400 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {errors.password[0]}
          </p>
        )}
      </div>

      {errors.general && (
        <div className="p-3 bg-red-900/40 border border-red-700/50 text-red-200 rounded-md flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <p className="text-sm">{errors.general}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all duration-200"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

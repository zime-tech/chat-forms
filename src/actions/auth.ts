"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// Login schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

// Registration schema
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

// Type for login form state
type LoginFormState = {
  error?:
    | string
    | {
        email?: string[];
        password?: string[];
      };
};

// Type for register form state
type RegisterFormState = {
  error?:
    | string
    | {
        name?: string[];
        email?: string[];
        password?: string[];
      };
};

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Rate limit: 5 login attempts per minute per IP
  const ip = await getClientIp();
  const rl = rateLimit(`login:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return { error: "Too many login attempts. Please wait a moment and try again." };
  }

  // Validate input
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if the credentials are valid
    if (!db) {
      return { error: "Database connection error" };
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !user.password) {
      return { error: "Invalid email or password" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: "Invalid email or password" };
    }

    // Redirect to login page with callbackUrl
    // This hack is needed because we can't directly use signIn in server actions
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`
    );
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Invalid email or password",
    };
  }

  // This return is needed to satisfy TypeScript, but will never be reached
  return {};
}

export async function register(
  state: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Rate limit: 3 registrations per minute per IP
  const ip = await getClientIp();
  const rl = rateLimit(`register:${ip}`, { maxRequests: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return { error: "Too many registration attempts. Please wait a moment and try again." };
  }

  // Validate input
  const validatedFields = registerSchema.safeParse({
    name,
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if db is available
    if (!db || !db.query || !db.query.users) {
      return {
        error: "Database connection error",
      };
    }

    // Check if email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
      return {
        error: {
          email: ["Email already in use"],
        },
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if db is available
    if (!db || !db.insert) {
      return {
        error: "Database connection error",
      };
    }

    // Create the user
    await db.insert(users).values({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // After creating the user account, redirect to login page
    redirect("/login?registered=true");
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: "Failed to create account. Please try again.",
    };
  }

  // This return is needed to satisfy TypeScript, but will never be reached
  return {};
}

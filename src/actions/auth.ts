"use server";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

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

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

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
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

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

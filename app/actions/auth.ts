"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { createSession, deleteSession } from "@/app/lib/session";
import { createUser, findUserByEmail } from "@/app/lib/db";

export type LoginFormState = {
  error?: string;
};

export type SignupFormState = {
  error?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function login(_: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = findUserByEmail(email);

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const passwordMatches = await compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { error: "Invalid email or password." };
  }

  await createSession(String(user.id));
  redirect("/dashboard");
}

export async function signup(_: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password || !confirmPassword) {
    return { error: "Email, password, and confirm password are required." };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  try {
    const passwordHash = await hash(password, 12);
    const user = createUser(email, passwordHash);

    await createSession(String(user.id));
  } catch {
    return { error: "Could not create account. Please try again." };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
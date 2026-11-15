"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

const registerSchema = z
  .object({
    displayName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password.";
    case "auth/operation-not-allowed":
      return "Email/password sign-up is not enabled.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "An error occurred. Please try again.";
  }
}

export default function RegisterForm() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setAuthError(null);
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      setAuthError(getFirebaseErrorMessage(firebaseError.code ?? ""));
    }
  }

  async function handleGoogleSignIn() {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setAuthError(getFirebaseErrorMessage(firebaseError.code ?? ""));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  const isLoading = isSubmitting || googleLoading;

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {authError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
            {authError}
          </div>
        )}

        {/* Display name field */}
        <div className="space-y-1.5">
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-foreground/80"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground/40" />
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              disabled={isLoading}
              {...register("displayName")}
              className="w-full rounded-xl border border-foreground/20 bg-foreground/[0.03] py-3 pl-11 pr-4 text-base text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-50 dark:bg-foreground/5 dark:border-foreground/15 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
            />
          </div>
          {errors.displayName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.displayName.message}
            </p>
          )}
        </div>

        {/* Email field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground/80"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground/40" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...register("email")}
              className="w-full rounded-xl border border-foreground/20 bg-foreground/[0.03] py-3 pl-11 pr-4 text-base text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-50 dark:bg-foreground/5 dark:border-foreground/15 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground/80"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground/40" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={isLoading}
              {...register("password")}
              className="w-full rounded-xl border border-foreground/20 bg-foreground/[0.03] py-3 pl-11 pr-4 text-base text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-50 dark:bg-foreground/5 dark:border-foreground/15 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground/80"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-foreground/40" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={isLoading}
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-foreground/20 bg-foreground/[0.03] py-3 pl-11 pr-4 text-base text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-50 dark:bg-foreground/5 dark:border-foreground/15 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Sign up button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-foreground/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-3 text-foreground/50">
            or continue with
          </span>
        </div>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-foreground/20 bg-background px-4 py-3 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:bg-foreground/[0.08] disabled:opacity-50 disabled:cursor-not-allowed dark:border-foreground/15 dark:hover:bg-foreground/[0.06]"
      >
        {googleLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Login link */}
      <p className="mt-8 text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-500 dark:hover:text-emerald-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import RegisterForm from "@/components/auth/RegisterForm";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (userProfile) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
          <span className="text-2xl font-bold text-white">M</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Start tracking your macros today
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}

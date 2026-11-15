import React, { type ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-surface-container rounded-3xl p-6 sm:p-8 shadow-xl border border-outline-variant/30">
        {children}
      </div>
    </div>
  );
}

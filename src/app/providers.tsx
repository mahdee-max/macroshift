"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { PremiumProvider } from "@/context/PremiumContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PremiumProvider>
        {children}
      </PremiumProvider>
    </AuthProvider>
  );
}

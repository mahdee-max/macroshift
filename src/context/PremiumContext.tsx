"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";

interface PremiumContextType {
  isPremium: boolean;
  togglePremium: () => void;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  togglePremium: () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useAuth();
  const [isPremiumOverride, setIsPremiumOverride] = useState<boolean | null>(null);

  const isPremium = isPremiumOverride ?? userProfile?.isPremium ?? false;

  const togglePremium = useCallback(() => {
    setIsPremiumOverride((prev) => !(prev ?? userProfile?.isPremium ?? false));
  }, [userProfile?.isPremium]);

  return (
    <PremiumContext.Provider value={{ isPremium, togglePremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return context;
}

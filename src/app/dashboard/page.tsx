"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePremium } from "@/context/PremiumContext";
import { useDailyLog } from "@/lib/hooks/useDailyLog";
import { getToday, formatDate, getDayOfWeek } from "@/lib/utils/date";
import { CalorieRing } from "@/components/dashboard/CalorieRing";
import { MealCard } from "@/components/dashboard/MealCard";
import { MacroBars } from "@/components/dashboard/MacroBars";
import { NutrientBars } from "@/components/dashboard/NutrientBars";
import { BottomNav } from "@/components/ui/BottomNav";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  WifiOff,
  RefreshCw,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import type { MealType } from "@/types";

function DashboardContent() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { isPremium } = usePremium();

  const [date, setDate] = useState<string>("");
  const { log, totals, isSyncing, removeFood } = useDailyLog(date || undefined);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setDate(getToday());
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    } else if (!authLoading && user && !userProfile) {
      router.replace("/onboarding");
    }
  }, [user, userProfile, authLoading, router]);

  if (authLoading || !userProfile || !date) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent" />
        <p className="text-xs text-on-surface-variant font-medium mt-3">
          Loading MacroShift...
        </p>
      </div>
    );
  }

  // Calculate day-specific calorie budget (with calorie cycling if enabled)
  let effectiveBudget = userProfile.calorieGoal || 2000;
  if (isPremium && userProfile.calorieCycling?.enabled) {
    const dayName = getDayOfWeek(date) as keyof typeof userProfile.calorieCycling.schedule;
    if (userProfile.calorieCycling.schedule?.[dayName]) {
      effectiveBudget = userProfile.calorieCycling.schedule[dayName];
    }
  }

  const shiftDate = (days: number) => {
    const current = new Date(date + "T00:00:00");
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split("T")[0]);
  };

  const isTodayDate = date === getToday();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* Top Header & Offline indicator */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              MacroShift
            </span>
            {isPremium && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-tertiary text-[9px] font-black text-on-tertiary-container">
                <Sparkles className="w-2.5 h-2.5" /> PRO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                <WifiOff className="w-3 h-3" /> Offline
              </div>
            )}
            {isSyncing && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-on-surface-variant" />
            )}
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full bg-primary-container text-primary font-bold text-xs flex items-center justify-center border border-outline-variant/30"
            >
              {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : "U"}
            </Link>
          </div>
        </div>

        {/* Date Selector Strip */}
        <div className="max-w-md mx-auto mt-2 flex items-center justify-between bg-surface-container rounded-xl px-2 py-1.5 border border-outline-variant/20 shadow-xs">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="p-1 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setDate(getToday())}
            className="flex items-center gap-1.5 text-xs font-bold text-on-surface hover:text-primary transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{isTodayDate ? "Today, " : ""}{formatDate(date)}</span>
          </button>

          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="p-1 rounded-lg hover:bg-surface-variant text-on-surface-variant transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        {/* Calorie Ring Gauge Card */}
        <div className="bg-surface-container rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex flex-col items-center">
          <CalorieRing
            consumed={totals.calories}
            budget={effectiveBudget}
            size={210}
          />
        </div>

        {/* Macronutrient Bars */}
        <MacroBars
          totals={totals}
          calorieGoal={effectiveBudget}
          macroGoals={userProfile.macroGoals}
        />

        {/* Micronutrients / Secondary Metrics */}
        <NutrientBars totals={totals} />

        {/* Meals Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Today&apos;s Meals
          </h2>
          <Link
            href="/food-search"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Quick Log</span>
          </Link>
        </div>

        {/* Meal Cards */}
        <div className="space-y-3">
          {(["breakfast", "lunch", "dinner", "snacks"] as MealType[]).map((mealType) => (
            <MealCard
              key={mealType}
              mealType={mealType}
              title={mealType}
              entries={log.meals[mealType] || []}
              onRemoveItem={(foodId) => removeFood(mealType, foodId)}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

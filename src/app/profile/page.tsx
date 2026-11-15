"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePremium } from "@/context/PremiumContext";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { addWeightEntry } from "@/lib/firebase/firestore";
import { getToday } from "@/lib/utils/date";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import {
  User,
  LogOut,
  Crown,
  ChevronRight,
  Scale,
  Sparkles,
  Check,
  Flame,
} from "lucide-react";
import Link from "next/link";

function ProfileContent() {
  const { user, userProfile, loading, setUserProfile } = useAuth();
  const { isPremium, togglePremium } = usePremium();
  const router = useRouter();

  const [newWeight, setNewWeight] = useState<number | "">("");
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [weightSuccess, setWeightSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    if (userProfile?.weight) {
      setNewWeight(userProfile.weight);
    }
  }, [user, userProfile, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const handleUpdateWeight = async () => {
    if (!user || !userProfile || !newWeight) return;
    setLoggingWeight(true);
    try {
      await addWeightEntry(user.uid, Number(newWeight), getToday());
      setUserProfile({
        ...userProfile,
        weight: Number(newWeight),
      });
      setWeightSuccess(true);
      setTimeout(() => setWeightSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to log weight:", err);
    } finally {
      setLoggingWeight(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      <header className="px-4 pt-4 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-black text-on-surface">Account & Profile</h1>
      </header>

      <main className="max-w-md mx-auto w-full px-4 space-y-4">
        {/* User Card */}
        <div className="bg-surface-container rounded-3xl p-4 flex items-center gap-4 border border-outline-variant/30 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-primary font-bold text-xl flex items-center justify-center shrink-0">
            {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : <User className="w-7 h-7" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-on-surface truncate">
              {userProfile.displayName}
            </h2>
            <p className="text-xs text-on-surface-variant truncate">
              {userProfile.email}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-primary/10 text-primary capitalize">
                Goal: {userProfile.goal}
              </span>
              {isPremium && (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-tertiary/20 text-tertiary">
                  PRO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nutritional Calibration Stats */}
        <div className="bg-surface-container rounded-3xl p-4 border border-outline-variant/30 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Metabolic Calibration
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface-variant/70 rounded-2xl p-2.5">
              <span className="text-lg font-black text-on-surface block">
                {userProfile.calorieGoal}
              </span>
              <span className="text-[10px] font-medium text-on-surface-variant">
                Daily Budget (kcal)
              </span>
            </div>
            <div className="bg-surface-variant/70 rounded-2xl p-2.5">
              <span className="text-lg font-black text-on-surface block">
                {userProfile.weight} kg
              </span>
              <span className="text-[10px] font-medium text-on-surface-variant">
                Weight
              </span>
            </div>
            <div className="bg-surface-variant/70 rounded-2xl p-2.5">
              <span className="text-lg font-black text-on-surface block">
                {userProfile.tdee}
              </span>
              <span className="text-[10px] font-medium text-on-surface-variant">
                TDEE (kcal)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Weight Logger */}
        <div className="bg-surface-container rounded-3xl p-4 border border-outline-variant/30 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-primary" /> Log Body Weight
            </span>
            <span className="text-[10px] text-on-surface-variant">Today</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 75.4"
              className="flex-1 h-11 px-3.5 rounded-xl bg-surface-variant font-mono font-bold text-sm text-on-surface border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-xs font-bold text-on-surface-variant">kg</span>
            <Button
              size="sm"
              loading={loggingWeight}
              onClick={handleUpdateWeight}
              leadingIcon={weightSuccess ? <Check className="w-3.5 h-3.5" /> : undefined}
            >
              {weightSuccess ? "Logged" : "Record"}
            </Button>
          </div>
        </div>

        {/* Premium Toggle Card */}
        <div className="bg-surface-container rounded-3xl p-4 border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-tertiary/10 text-tertiary">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Pro Membership</p>
              <p className="text-xs text-on-surface-variant">
                Custom macros, calorie cycling & AI camera
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={togglePremium}
            className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
              isPremium ? "bg-primary" : "bg-outline-variant"
            }`}
            aria-label="Toggle Premium Tier"
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isPremium ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Links Menu */}
        <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/30 shadow-xs divide-y divide-outline-variant/20">
          <Link
            href="/premium/settings"
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-surface-variant transition-colors"
          >
            <span className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tertiary" /> Macro Goals & Cycling
            </span>
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </Link>

          <Link
            href="/onboarding"
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-surface-variant transition-colors"
          >
            <span className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" /> Recalculate TDEE Wizard
            </span>
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-4 py-3.5 flex items-center gap-2 hover:bg-surface-variant transition-colors text-error text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

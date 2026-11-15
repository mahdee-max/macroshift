"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePremium } from "@/context/PremiumContext";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { percentageToGrams, gramsToPercentage } from "@/lib/utils/macros";
import { CalorieCyclingView } from "@/components/dashboard/CalorieCycling";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowLeft,
  Crown,
  PieChart,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import type { MacroGoals, CalorieCycling } from "@/types";

const MACRO_PRESETS: { name: string; desc: string; goals: MacroGoals }[] = [
  {
    name: "Balanced",
    desc: "Everyday health and sustainable fitness",
    goals: { mode: "percentage", protein: 30, carbs: 40, fats: 30 },
  },
  {
    name: "High Protein",
    desc: "Muscle building and strength retention during cut",
    goals: { mode: "percentage", protein: 40, carbs: 35, fats: 25 },
  },
  {
    name: "Low Carb",
    desc: "Reduced insulin response and steady energy",
    goals: { mode: "percentage", protein: 35, carbs: 20, fats: 45 },
  },
  {
    name: "Endurance Athlete",
    desc: "High glycogen replenishment for runners and cyclists",
    goals: { mode: "percentage", protein: 20, carbs: 60, fats: 20 },
  },
];

export default function PremiumSettingsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, setUserProfile } = useAuth();
  const { isPremium, togglePremium } = usePremium();

  const calorieGoal = userProfile?.calorieGoal || 2000;

  const [mode, setMode] = useState<"percentage" | "grams">(
    userProfile?.macroGoals?.mode || "percentage"
  );
  const [proteinPct, setProteinPct] = useState(userProfile?.macroGoals?.protein ?? 30);
  const [carbsPct, setCarbsPct] = useState(userProfile?.macroGoals?.carbs ?? 40);
  const [fatsPct, setFatsPct] = useState(userProfile?.macroGoals?.fats ?? 30);

  // Exact grams state
  const initialGrams = percentageToGrams(calorieGoal, proteinPct, carbsPct, fatsPct);
  const [proteinGrams, setProteinGrams] = useState(
    userProfile?.macroGoals?.mode === "grams" ? userProfile.macroGoals.protein : initialGrams.protein
  );
  const [carbsGrams, setCarbsGrams] = useState(
    userProfile?.macroGoals?.mode === "grams" ? userProfile.macroGoals.carbs : initialGrams.carbs
  );
  const [fatsGrams, setFatsGrams] = useState(
    userProfile?.macroGoals?.mode === "grams" ? userProfile.macroGoals.fats : initialGrams.fats
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Total percentage check
  const totalPercentage = proteinPct + carbsPct + fatsPct;
  const isPercentageValid = totalPercentage === 100;

  // Grams to calories
  const gramsCalories = proteinGrams * 4 + carbsGrams * 4 + fatsGrams * 9;

  // Calculated grams from percentage
  const calculatedFromPct = percentageToGrams(calorieGoal, proteinPct, carbsPct, fatsPct);

  const handleApplyPreset = (preset: (typeof MACRO_PRESETS)[0]) => {
    setMode("percentage");
    setProteinPct(preset.goals.protein);
    setCarbsPct(preset.goals.carbs);
    setFatsPct(preset.goals.fats);
    const converted = percentageToGrams(
      calorieGoal,
      preset.goals.protein,
      preset.goals.carbs,
      preset.goals.fats
    );
    setProteinGrams(converted.protein);
    setCarbsGrams(converted.carbs);
    setFatsGrams(converted.fats);
  };

  const handleSaveMacroGoals = async () => {
    if (!user || !userProfile) return;
    if (mode === "percentage" && !isPercentageValid) return;

    setSaving(true);
    try {
      const updatedGoals: MacroGoals =
        mode === "percentage"
          ? {
              mode: "percentage",
              protein: proteinPct,
              carbs: carbsPct,
              fats: fatsPct,
            }
          : {
              mode: "grams",
              protein: proteinGrams,
              carbs: carbsGrams,
              fats: fatsGrams,
            };

      await updateUserProfile(user.uid, { macroGoals: updatedGoals });
      setUserProfile({
        ...userProfile,
        macroGoals: updatedGoals,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save macro goals:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCalorieCycling = async (cycling: CalorieCycling) => {
    if (!user || !userProfile) return;
    await updateUserProfile(user.uid, { calorieCycling: cycling });
    setUserProfile({
      ...userProfile,
      calorieCycling: cycling,
    });
  };

  if (authLoading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-tertiary" />
            <h1 className="text-sm font-bold text-on-surface">Premium Engine</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-5">
        {/* Premium Status Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-5 shadow-md border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-primary/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3 h-3" />
                {isPremium ? "Pro Tier Active" : "Free Tier"}
              </div>
              <h2 className="text-lg font-black tracking-tight">
                {isPremium ? "Unlimited Precision Mode" : "Unlock Custom Macros"}
              </h2>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                {isPremium
                  ? "Custom macro locks and calorie cycling are fully active."
                  : "Toggle below to enable premium features for demonstration."}
              </p>
            </div>
            <button
              onClick={togglePremium}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
                isPremium ? "bg-tertiary" : "bg-white/20"
              }`}
              aria-label="Toggle Premium"
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isPremium ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Macro Goal Engine Card */}
        <div className="bg-surface-container rounded-3xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-container text-primary">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Macro Goal Engine</h3>
                <p className="text-xs text-on-surface-variant">
                  Calibrated to your {calorieGoal} kcal target
                </p>
              </div>
            </div>

            {/* Mode switch */}
            <div className="inline-flex rounded-xl bg-surface-variant p-0.5 border border-outline-variant/30 text-xs">
              <button
                type="button"
                onClick={() => setMode("percentage")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  mode === "percentage"
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface-variant"
                }`}
              >
                % Ratio
              </button>
              <button
                type="button"
                onClick={() => setMode("grams")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  mode === "grams"
                    ? "bg-primary text-white shadow-xs"
                    : "text-on-surface-variant"
                }`}
              >
                Grams
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
              Popular Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {MACRO_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-surface-variant hover:bg-surface-variant/80 border border-outline-variant/20 transition-all text-xs group"
                >
                  <div className="font-bold text-on-surface group-hover:text-primary">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">
                    {preset.goals.protein}P / {preset.goals.carbs}C / {preset.goals.fats}F
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PERCENTAGE MODE CONTROLS */}
          {mode === "percentage" ? (
            <div className="space-y-3 pt-2">
              {/* Protein Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Protein ({proteinPct}%)
                  </span>
                  <span className="text-on-surface font-mono">
                    {calculatedFromPct.protein}g (~{calculatedFromPct.protein * 4} kcal)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={proteinPct}
                  onChange={(e) => setProteinPct(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer"
                />
              </div>

              {/* Carbs Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-secondary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Carbohydrates ({carbsPct}%)
                  </span>
                  <span className="text-on-surface font-mono">
                    {calculatedFromPct.carbs}g (~{calculatedFromPct.carbs * 4} kcal)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={carbsPct}
                  onChange={(e) => setCarbsPct(Number(e.target.value))}
                  className="w-full accent-secondary h-2 bg-surface-variant rounded-lg cursor-pointer"
                />
              </div>

              {/* Fats Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-tertiary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                    Fats ({fatsPct}%)
                  </span>
                  <span className="text-on-surface font-mono">
                    {calculatedFromPct.fats}g (~{calculatedFromPct.fats * 9} kcal)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={fatsPct}
                  onChange={(e) => setFatsPct(Number(e.target.value))}
                  className="w-full accent-tertiary h-2 bg-surface-variant rounded-lg cursor-pointer"
                />
              </div>

              {/* Total percentage validation indicator */}
              <div
                className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-bold ${
                  isPercentageValid
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-error/10 text-error border border-error/20"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isPercentageValid ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>
                    Total: {totalPercentage}%{" "}
                    {!isPercentageValid && `(${100 - totalPercentage}% needed)`}
                  </span>
                </div>
                {isPercentageValid && <span>100% Balanced</span>}
              </div>
            </div>
          ) : (
            /* EXACT GRAMS MODE CONTROLS */
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary block">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={400}
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(Number(e.target.value))}
                    className="w-full h-11 rounded-xl bg-surface-variant px-3 font-mono font-bold text-sm text-on-surface border border-outline-variant/30 text-center outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-[10px] text-on-surface-variant block text-center">
                    {proteinGrams * 4} kcal
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-secondary block">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={600}
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(Number(e.target.value))}
                    className="w-full h-11 rounded-xl bg-surface-variant px-3 font-mono font-bold text-sm text-on-surface border border-outline-variant/30 text-center outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <span className="text-[10px] text-on-surface-variant block text-center">
                    {carbsGrams * 4} kcal
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-tertiary block">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={250}
                    value={fatsGrams}
                    onChange={(e) => setFatsGrams(Number(e.target.value))}
                    className="w-full h-11 rounded-xl bg-surface-variant px-3 font-mono font-bold text-sm text-on-surface border border-outline-variant/30 text-center outline-none focus:ring-2 focus:ring-tertiary"
                  />
                  <span className="text-[10px] text-on-surface-variant block text-center">
                    {fatsGrams * 9} kcal
                  </span>
                </div>
              </div>

              <div className="bg-surface-variant/80 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">
                  Total Macro Energy:
                </span>
                <span className="font-extrabold text-on-surface">
                  {gramsCalories} kcal / {calorieGoal} kcal target
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              loading={saving}
              disabled={mode === "percentage" && !isPercentageValid}
              onClick={handleSaveMacroGoals}
              leadingIcon={saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            >
              {saveSuccess ? "Goals Applied" : "Save Macro Goals"}
            </Button>
          </div>
        </div>

        {/* Calorie Cycling Section */}
        <CalorieCyclingView
          baselineCalories={calorieGoal}
          initialCycling={userProfile.calorieCycling}
          onSave={handleSaveCalorieCycling}
        />
      </main>

      <BottomNav />
    </div>
  );
}

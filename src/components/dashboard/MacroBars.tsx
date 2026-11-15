"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import { usePremium } from "@/context/PremiumContext";
import type { MacroGoals, NutritionTotals } from "@/types";
import { getMacroTargetsInGrams } from "@/lib/utils/macros";

export interface MacroBarsProps {
  totals: NutritionTotals;
  calorieGoal: number;
  macroGoals?: MacroGoals;
}

export function MacroBars({ totals, calorieGoal, macroGoals }: MacroBarsProps) {
  const { isPremium } = usePremium();

  const defaultGoals: MacroGoals = macroGoals || {
    mode: "percentage",
    protein: 30,
    carbs: 40,
    fats: 30,
  };

  const targets = getMacroTargetsInGrams(calorieGoal, defaultGoals);

  const macros = [
    {
      label: "Protein",
      current: totals.protein,
      target: targets.protein,
      unit: "g",
      color: "bg-primary",
      textColor: "text-primary",
      pct: defaultGoals.protein,
    },
    {
      label: "Carbohydrates",
      current: totals.carbs,
      target: targets.carbs,
      unit: "g",
      color: "bg-secondary",
      textColor: "text-secondary",
      pct: defaultGoals.carbs,
    },
    {
      label: "Fats",
      current: totals.fats,
      target: targets.fats,
      unit: "g",
      color: "bg-tertiary",
      textColor: "text-tertiary",
      pct: defaultGoals.fats,
    },
  ];

  return (
    <div className="bg-surface-container rounded-2xl p-4 shadow-sm border border-outline-variant/30 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Macronutrients
          </h3>
          {isPremium && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
              <Sparkles className="w-2.5 h-2.5" />
              CUSTOM
            </span>
          )}
        </div>

        {isPremium ? (
          <Link
            href="/premium/settings"
            className="text-[11px] font-bold text-primary hover:underline"
          >
            Adjust Goals
          </Link>
        ) : (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-tertiary hover:underline"
          >
            <Lock className="w-3 h-3" />
            <span>Customize (PRO)</span>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {macros.map((m) => {
          const ratio = m.target > 0 ? Math.min((m.current / m.target) * 100, 100) : 0;
          const isOver = m.current > m.target && m.target > 0;

          return (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${m.color}`} />
                  {m.label}
                  <span className="text-[10px] text-on-surface-variant/70 font-normal">
                    ({m.pct}%)
                  </span>
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  <span className={isOver ? "text-error font-bold" : "text-on-surface font-semibold"}>
                    {Math.round(m.current)}
                  </span>
                  {" "}/ {m.target} {m.unit}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-surface-variant overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isOver ? "bg-error" : m.color
                  }`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

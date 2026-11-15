"use client";

import React from "react";
import type { NutritionTotals } from "@/types";

export interface NutrientBarsProps {
  totals: NutritionTotals;
}

export function NutrientBars({ totals }: NutrientBarsProps) {
  // Standard daily recommended reference intakes
  const secondaryNutrients = [
    {
      label: "Dietary Fiber",
      current: totals.fiber || 0,
      target: 30, // 30g daily goal
      unit: "g",
      color: "bg-emerald-500",
      type: "min", // aim to meet or exceed
    },
    {
      label: "Sodium",
      current: totals.sodium || 0,
      target: 2300, // 2300mg daily ceiling
      unit: "mg",
      color: "bg-amber-500",
      type: "max", // aim to stay under
    },
    {
      label: "Sugar",
      current: totals.sugar || 0,
      target: 50, // 50g daily ceiling
      unit: "g",
      color: "bg-rose-500",
      type: "max", // aim to stay under
    },
  ];

  return (
    <div className="bg-surface-container rounded-2xl p-4 shadow-sm border border-outline-variant/30 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Micronutrients & Secondary Metrics
        </h3>
        <span className="text-[10px] text-on-surface-variant/70 font-medium">
          Daily Dietary References
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {secondaryNutrients.map((n) => {
          const percent = Math.min((n.current / n.target) * 100, 100);
          const isWarning = n.type === "max" ? n.current > n.target : false;

          return (
            <div
              key={n.label}
              className="bg-surface-variant/60 rounded-xl p-3 border border-outline-variant/20 flex flex-col justify-between"
            >
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-on-surface">
                  {n.label}
                </span>
                <span className={`text-[11px] font-bold ${isWarning ? "text-error" : "text-on-surface"}`}>
                  {Math.round(n.current)} / {n.target} {n.unit}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWarning ? "bg-error" : n.color
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Plus, Check, ChevronDown } from "lucide-react";
import type { MealType, USDASearchResult } from "@/types";
import { usdaResultToFoodEntry } from "@/lib/api/usda";

export interface FoodResultCardProps {
  food: USDASearchResult;
  selectedMeal: MealType;
  onLog: (mealType: MealType, food: ReturnType<typeof usdaResultToFoodEntry>) => Promise<void>;
}

export function FoodResultCard({
  food,
  selectedMeal,
  onLog,
}: FoodResultCardProps) {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [meal, setMeal] = useState<MealType>(selectedMeal);
  const [isLogging, setIsLogging] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const entry = usdaResultToFoodEntry(food, multiplier);

  const handleLog = async () => {
    setIsLogging(true);
    try {
      await onLog(meal, entry);
      setLoggedSuccess(true);
      setTimeout(() => setLoggedSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to log food:", err);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/30 shadow-xs hover:border-outline/50 transition-all flex flex-col gap-3">
      {/* Title & Brand */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="text-sm font-bold text-on-surface leading-snug line-clamp-2">
            {food.description}
          </h4>
          {food.brandName && (
            <p className="text-xs text-primary font-medium mt-0.5">
              {food.brandName}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-extrabold text-on-surface">
            {entry.calories}
          </span>
          <span className="text-xs text-on-surface-variant block font-medium">kcal</span>
        </div>
      </div>

      {/* Macros Badge Row */}
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
          P: {entry.protein}g
        </span>
        <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-semibold">
          C: {entry.carbs}g
        </span>
        <span className="px-2 py-0.5 rounded-md bg-tertiary/10 text-tertiary font-semibold">
          F: {entry.fats}g
        </span>
        <span className="text-[11px] text-on-surface-variant ml-auto">
          {entry.servingSize} {entry.servingUnit}
        </span>
      </div>

      {/* Serving Multiplier & Meal selection */}
      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {[0.5, 1, 1.5, 2].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMultiplier(m)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                multiplier === m
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-variant text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {m}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value as MealType)}
            className="text-xs font-semibold bg-surface-variant text-on-surface rounded-lg px-2 py-1.5 border border-outline-variant/30 outline-none capitalize"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>

          <button
            type="button"
            disabled={isLogging}
            onClick={handleLog}
            className={`
              h-8 px-3 rounded-xl flex items-center gap-1 text-xs font-bold transition-all shadow-xs
              ${
                loggedSuccess
                  ? "bg-secondary text-white"
                  : "bg-primary text-white hover:brightness-110 active:scale-95"
              }
            `}
          >
            {loggedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Logged</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Log</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

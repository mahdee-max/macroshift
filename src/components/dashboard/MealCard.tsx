"use client";

import React from "react";
import Link from "next/link";
import { Plus, Trash2, Coffee, Utensils, Moon, Apple } from "lucide-react";
import type { FoodEntry, MealType } from "@/types";

export interface MealCardProps {
  mealType: MealType;
  title: string;
  entries: FoodEntry[];
  onRemoveItem: (foodId: string) => void;
  onAddClick?: () => void;
}

const MEAL_ICONS: Record<MealType, React.ElementType> = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snacks: Apple,
};

export function MealCard({
  mealType,
  title,
  entries,
  onRemoveItem,
  onAddClick,
}: MealCardProps) {
  const Icon = MEAL_ICONS[mealType] || Utensils;
  const totalCalories = entries.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = Math.round(entries.reduce((sum, item) => sum + (item.protein || 0), 0));
  const totalCarbs = Math.round(entries.reduce((sum, item) => sum + (item.carbs || 0), 0));
  const totalFats = Math.round(entries.reduce((sum, item) => sum + (item.fats || 0), 0));

  return (
    <div className="bg-surface-container rounded-2xl p-4 shadow-sm border border-outline-variant/30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-container text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface leading-tight capitalize">
              {title}
            </h3>
            <span className="text-xs font-semibold text-primary">
              {totalCalories.toLocaleString()} kcal
            </span>
          </div>
        </div>

        <Link
          href={`/food-search?meal=${mealType}`}
          onClick={onAddClick}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </Link>
      </div>

      {/* Entries List */}
      <div className="pt-2 divide-y divide-outline-variant/10">
        {entries.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-on-surface-variant/80">
              No foods logged for {title.toLowerCase()}
            </p>
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="py-2.5 flex items-center justify-between gap-2 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-on-surface truncate">
                    {item.name}
                  </p>
                  {item.source === "ai_scan" && (
                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-tertiary/20 text-tertiary">
                      AI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5">
                  <span>
                    {item.servingSize} {item.servingUnit}
                  </span>
                  <span>•</span>
                  <span className="text-primary font-medium">P: {item.protein}g</span>
                  <span>•</span>
                  <span className="text-secondary font-medium">C: {item.carbs}g</span>
                  <span>•</span>
                  <span className="text-tertiary font-medium">F: {item.fats}g</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface font-mono">
                  {item.calories} kcal
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Meal Subtotal Macros (if entries exist) */}
      {entries.length > 0 && (
        <div className="mt-2 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] font-medium text-on-surface-variant">
          <span>Meal Total Macros:</span>
          <div className="flex gap-2.5 font-bold">
            <span className="text-primary">P: {totalProtein}g</span>
            <span className="text-secondary">C: {totalCarbs}g</span>
            <span className="text-tertiary">F: {totalFats}g</span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Sparkles, Check, Edit2, Flame } from "lucide-react";
import type { AIFoodScanResult, MealType, FoodEntry } from "@/types";

export interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: AIFoodScanResult | null;
  imagePreviewUrl: string | null;
  isDemo?: boolean;
  onConfirmLog: (mealType: MealType, entry: Omit<FoodEntry, "id" | "addedAt">) => Promise<void>;
}

export function ScanResultModal({
  isOpen,
  onClose,
  scanResult,
  imagePreviewUrl,
  isDemo,
  onConfirmLog,
}: ScanResultModalProps) {
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [title, setTitle] = useState(
    scanResult?.food_items?.join(", ") || "Identified Meal"
  );
  const [calories, setCalories] = useState(scanResult?.estimated_calories || 450);
  const [protein, setProtein] = useState(scanResult?.macros?.protein || 30);
  const [carbs, setCarbs] = useState(scanResult?.macros?.carbs || 40);
  const [fats, setFats] = useState(scanResult?.macros?.fats || 15);

  const [saving, setSaving] = useState(false);

  // Sync state if scanResult updates
  React.useEffect(() => {
    if (scanResult) {
      setTitle(scanResult.food_items?.join(", ") || "Identified Meal");
      setCalories(scanResult.estimated_calories || 450);
      setProtein(scanResult.macros?.protein || 30);
      setCarbs(scanResult.macros?.carbs || 40);
      setFats(scanResult.macros?.fats || 15);
    }
  }, [scanResult]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirmLog(mealType, {
        name: title,
        servingSize: 1,
        servingUnit: "meal",
        quantity: 1,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
        source: "ai_scan",
      });
      onClose();
    } catch (err) {
      console.error("Failed to commit AI meal:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!scanResult) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Meal Breakdown"
      description="Review and adjust the detected nutrients before logging"
    >
      <div className="space-y-4">
        {/* Image Preview & AI badge */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-outline-variant/30 flex items-center justify-center">
          {imagePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="Scanned meal"
              className="w-full h-full object-cover"
            />
          ) : (
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          )}

          <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
            <Sparkles className="w-3 h-3 text-tertiary" />
            <span>Gemini Vision AI</span>
            {isDemo && <span className="text-tertiary">(Demo Scan)</span>}
          </div>
        </div>

        {/* Meal Name input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Identified Items
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-variant text-sm font-semibold text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Edit2 className="w-4 h-4 text-on-surface-variant absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Target Meal Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Add to Meal
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["breakfast", "lunch", "dinner", "snacks"] as MealType[]).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMealType(m)}
                className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                  mealType === m
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-variant text-on-surface border-outline-variant/30 hover:border-outline"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Energy & Macros Editable Grid */}
        <div className="bg-surface-variant/80 rounded-2xl p-3.5 border border-outline-variant/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-primary" /> Estimated Calories
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-20 h-9 rounded-lg bg-surface text-center font-mono font-extrabold text-sm text-on-surface border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-xs font-bold text-on-surface-variant">kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-primary block text-center">
                Protein
              </label>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-14 h-8 rounded-lg bg-surface text-center font-mono font-bold text-xs text-on-surface border border-outline-variant/30 outline-none"
                />
                <span className="text-[10px] text-on-surface-variant font-medium">g</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-secondary block text-center">
                Carbs
              </label>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-14 h-8 rounded-lg bg-surface text-center font-mono font-bold text-xs text-on-surface border border-outline-variant/30 outline-none"
                />
                <span className="text-[10px] text-on-surface-variant font-medium">g</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-tertiary block text-center">
                Fats
              </label>
              <div className="flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-14 h-8 rounded-lg bg-surface text-center font-mono font-bold text-xs text-on-surface border border-outline-variant/30 outline-none"
                />
                <span className="text-[10px] text-on-surface-variant font-medium">g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={handleConfirm}
            leadingIcon={<Check className="w-4 h-4" />}
          >
            Confirm & Log
          </Button>
        </div>
      </div>
    </Modal>
  );
}

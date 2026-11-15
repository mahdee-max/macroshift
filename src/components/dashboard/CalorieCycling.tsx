"use client";

import React, { useState } from "react";
import { Calendar, Save, Sparkles, Check } from "lucide-react";
import type { CalorieCycling } from "@/types";
import { Button } from "@/components/ui/Button";

export interface CalorieCyclingProps {
  baselineCalories: number;
  initialCycling?: CalorieCycling;
  onSave: (cycling: CalorieCycling) => Promise<void>;
}

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

export function CalorieCyclingView({
  baselineCalories,
  initialCycling,
  onSave,
}: CalorieCyclingProps) {
  const [enabled, setEnabled] = useState(initialCycling?.enabled ?? false);
  const [schedule, setSchedule] = useState({
    monday: initialCycling?.schedule?.monday ?? baselineCalories,
    tuesday: initialCycling?.schedule?.tuesday ?? baselineCalories,
    wednesday: initialCycling?.schedule?.wednesday ?? baselineCalories,
    thursday: initialCycling?.schedule?.thursday ?? baselineCalories,
    friday: initialCycling?.schedule?.friday ?? baselineCalories + 250,
    saturday: initialCycling?.schedule?.saturday ?? baselineCalories + 250,
    sunday: initialCycling?.schedule?.sunday ?? baselineCalories,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const weeklyAverage = Math.round(
    Object.values(schedule).reduce((sum, val) => sum + val, 0) / 7
  );

  const handleDayChange = (dayKey: keyof typeof schedule, delta: number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: Math.max(1000, prev[dayKey] + delta),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        enabled,
        schedule,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary-container text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span>Calorie Cycling</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
                PRO
              </span>
            </h3>
            <p className="text-xs text-on-surface-variant">
              Cycle calories between high training days and recovery days
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-outline-variant"
          }`}
          aria-label="Toggle Calorie Cycling"
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2 border-t border-outline-variant/20 animate-in fade-in duration-200">
          <div className="bg-surface-variant/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-medium">
              Weekly Daily Average:
            </span>
            <span className="font-extrabold text-on-surface text-sm">
              {weeklyAverage.toLocaleString()} kcal/day
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DAYS.map(({ key, label }) => {
              const val = schedule[key];
              const diff = val - baselineCalories;

              return (
                <div
                  key={key}
                  className="bg-surface-variant/40 rounded-xl p-2.5 border border-outline-variant/20 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-on-surface">{label}</span>
                    <span
                      className={`text-[10px] ml-1.5 font-semibold ${
                        diff > 0
                          ? "text-secondary"
                          : diff < 0
                          ? "text-tertiary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "Baseline"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDayChange(key, -50)}
                      className="w-6 h-6 rounded-md bg-surface text-on-surface font-bold text-xs flex items-center justify-center border border-outline-variant/30 hover:bg-surface-variant"
                    >
                      -
                    </button>
                    <span className="w-14 text-center font-bold text-xs text-on-surface font-mono">
                      {val}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDayChange(key, 50)}
                      className="w-6 h-6 rounded-md bg-surface text-on-surface font-bold text-xs flex items-center justify-center border border-outline-variant/30 hover:bg-surface-variant"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              loading={saving}
              onClick={handleSave}
              leadingIcon={savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            >
              {savedSuccess ? "Saved Successfully" : "Apply Schedule"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

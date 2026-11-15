"use client";

import React from "react";
import { Flame, CheckCircle, AlertCircle } from "lucide-react";

export interface CalorieRingProps {
  consumed: number;
  budget: number;
  size?: number;
}

export function CalorieRing({ consumed, budget, size = 220 }: CalorieRingProps) {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validBudget = budget > 0 ? budget : 2000;
  const progressRatio = Math.min(consumed / validBudget, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  const remaining = validBudget - consumed;
  const isOver = remaining < 0;

  // Primary color when in budget, Error color when exceeded
  const ringColor = isOver ? "var(--md-error)" : "var(--md-primary)";

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative inline-flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform drop-shadow-sm"
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--md-surface-variant)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span>{isOver ? "Over Budget" : "Remaining"}</span>
          </div>

          <div className="text-4xl font-black tracking-tight text-on-surface my-0.5">
            {Math.abs(remaining).toLocaleString()}
          </div>

          <div className="text-[11px] font-medium text-on-surface-variant">
            {consumed.toLocaleString()} / {validBudget.toLocaleString()} kcal
          </div>

          {isOver ? (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-error font-bold bg-error/10 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              <span>Limit Exceeded</span>
            </div>
          ) : (
            remaining <= 200 && remaining >= 0 && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                <span>On Target</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

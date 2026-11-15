"use client";

import React from "react";

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  unit?: string;
  color?: string;
  trackColor?: string;
  height?: number; // in pixels
  showValues?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  unit = "g",
  color = "bg-primary",
  trackColor = "bg-surface-variant",
  height = 8,
  showValues = true,
  className = "",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  const isOver = value > max && max > 0;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showValues) && (
        <div className="flex justify-between items-center text-xs">
          {label && (
            <span className="font-semibold text-on-surface">{label}</span>
          )}
          {showValues && (
            <span className="font-medium text-on-surface-variant">
              <span className={isOver ? "text-error font-bold" : "text-on-surface"}>
                {Math.round(value)}
              </span>{" "}
              / {Math.round(max)} {unit}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${trackColor}`}
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isOver ? "bg-error" : color
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

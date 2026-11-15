"use client";

import React from "react";

export interface ProgressRingProps {
  value: number; // 0 to 100+
  max?: number;
  size?: number; // pixel diameter
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 180,
  strokeWidth = 14,
  color = "var(--md-primary)",
  trackColor = "var(--md-surface-variant)",
  label,
  subLabel,
  children,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {children ? (
          children
        ) : (
          <>
            {label && (
              <span className="text-2xl font-bold tracking-tight text-on-surface">
                {label}
              </span>
            )}
            {subLabel && (
              <span className="text-xs font-medium text-on-surface-variant mt-0.5">
                {subLabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

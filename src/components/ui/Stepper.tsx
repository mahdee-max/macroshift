"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
  onStepClick?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-variant -translate-y-1/2 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 -z-0"
          style={{
            width: `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
          }}
        />

        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={label} className="flex flex-col items-center relative z-10">
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || index > currentStep}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-200 border-2
                  ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isCurrent
                      ? "bg-primary border-primary text-white shadow-md scale-110"
                      : "bg-surface border-outline-variant text-on-surface-variant"
                  }
                  ${onStepClick && index <= currentStep ? "cursor-pointer" : "cursor-default"}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
              </button>
              <span
                className={`
                  mt-1.5 text-[10px] font-medium hidden sm:block max-w-[64px] text-center truncate
                  ${isCurrent ? "text-primary font-bold" : "text-on-surface-variant"}
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon,
      trailingIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full h-12 rounded-xl bg-surface-variant px-4 text-sm text-on-surface
              placeholder:text-on-surface-variant/70 border transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              ${leadingIcon ? "pl-11" : ""}
              ${trailingIcon ? "pr-11" : ""}
              ${error ? "border-error focus:ring-error" : "border-outline-variant/40 hover:border-outline"}
              ${className}
            `}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3.5 text-on-surface-variant flex items-center">
              {trailingIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

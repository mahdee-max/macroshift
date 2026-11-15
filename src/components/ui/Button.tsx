"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "outlined" | "text" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "filled",
      size = "md",
      loading = false,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs rounded-full gap-1.5",
      md: "h-11 px-5 text-sm rounded-full gap-2",
      lg: "h-13 px-6 text-base rounded-full gap-2.5",
    };

    const variantStyles = {
      filled:
        "bg-primary text-white shadow-sm hover:brightness-110 focus:ring-primary",
      tonal:
        "bg-primary-container text-primary hover:bg-opacity-90 focus:ring-primary",
      outlined:
        "border border-outline text-on-surface hover:bg-surface-variant focus:ring-primary bg-transparent",
      text: "text-primary hover:bg-surface-variant focus:ring-primary bg-transparent",
      danger:
        "bg-error text-white hover:brightness-110 focus:ring-error",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>
        )}
        <span>{children}</span>
        {!loading && trailingIcon && (
          <span className="inline-flex shrink-0">{trailingIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

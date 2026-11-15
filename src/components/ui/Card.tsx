"use client";

import React, { type HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "filled" | "outlined";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "elevated", className = "", ...props }, ref) => {
    const variantStyles = {
      elevated: "bg-surface-container shadow-md border border-outline-variant/30",
      filled: "bg-surface-variant border-transparent",
      outlined: "bg-surface border border-outline-variant",
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-4 transition-all duration-200 text-on-surface ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-3 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-on-surface ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-3 border-t border-outline-variant/30 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}

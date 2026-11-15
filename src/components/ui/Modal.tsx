"use client";

import React, { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-[95vw] sm:max-w-2xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`
          w-full ${sizeClasses[size]} bg-surface-container rounded-t-3xl sm:rounded-3xl
          p-6 shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh]
          animate-in slide-in-from-bottom duration-300 sm:zoom-in-95
        `}
      >
        <div className="flex items-start justify-between pb-3 border-b border-outline-variant/30">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-on-surface">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-on-surface-variant mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {children}
        </div>

        {footer && (
          <div className="pt-3 border-t border-outline-variant/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Camera, User, Sparkles } from "lucide-react";
import { usePremium } from "@/context/PremiumContext";

export function BottomNav() {
  const pathname = usePathname();
  const { isPremium } = usePremium();

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Search",
      href: "/food-search",
      icon: Search,
    },
    {
      label: "AI Camera",
      href: "/premium/camera",
      icon: Camera,
      badge: !isPremium ? "PRO" : undefined,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container/95 backdrop-blur-md border-t border-outline-variant/30 pb-safe shadow-lg"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center flex-1 h-full py-1
                transition-all duration-200 select-none group
              `}
            >
              <div
                className={`
                  relative px-5 py-1 rounded-full transition-all duration-200
                  ${isActive ? "bg-primary-container text-primary" : "text-on-surface-variant hover:text-on-surface"}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-tertiary text-[9px] font-extrabold text-on-tertiary-container shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`
                  text-[11px] font-medium mt-0.5 tracking-tight transition-colors duration-200
                  ${isActive ? "text-primary font-bold" : "text-on-surface-variant"}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

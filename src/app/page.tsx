"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScanLine, PieChart, WifiOff } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: ScanLine,
    title: "AI Food Scanner",
    description: "Snap a photo and get instant nutrition data",
  },
  {
    icon: PieChart,
    title: "Macro Tracking",
    description: "Monitor protein, carbs, and fat effortlessly",
  },
  {
    icon: WifiOff,
    title: "Offline First",
    description: "Works without internet — syncs when you're back",
  },
] as const;

export default function LandingPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && userProfile) {
      router.replace("/dashboard");
    } else if (user && !userProfile) {
      router.replace("/onboarding");
    }
  }, [user, userProfile, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gradient-to-b from-indigo-600 to-purple-700 text-white">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2">
            <span className="text-4xl font-black tracking-tighter">M</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight">MacroShift</h1>
          <p className="text-lg text-white/80 font-medium">
            Track smarter. Eat better.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="w-full max-w-sm mt-8 space-y-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-white/70">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CTA */}
      <footer className="px-6 pb-10 pt-6 flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        <Link
          href="/register"
          className="w-full py-3.5 rounded-full bg-white text-indigo-700 text-center font-bold text-base shadow-lg active:scale-[0.98] transition-transform"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="text-sm text-white/80 hover:text-white transition-colors font-medium"
        >
          Already have an account? <span className="underline">Sign In</span>
        </Link>
      </footer>
    </div>
  );
}

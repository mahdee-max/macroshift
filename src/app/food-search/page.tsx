"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDailyLog } from "@/lib/hooks/useDailyLog";
import { searchFoods } from "@/lib/api/usda";
import { FoodSearchInput } from "@/components/food/FoodSearchInput";
import { FoodResultCard } from "@/components/food/FoodResultCard";
import { BottomNav } from "@/components/ui/BottomNav";
import type { MealType, USDASearchResult } from "@/types";
import { ArrowLeft, Utensils, Sparkles } from "lucide-react";
import Link from "next/link";

const POPULAR_QUERIES = [
  "Chicken Breast",
  "Whole Egg",
  "Rolled Oats",
  "White Rice",
  "Greek Yogurt",
  "Salmon Fillet",
  "Avocado",
  "Banana",
  "Whey Protein",
  "Peanut Butter",
];

function FoodSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMeal = (searchParams.get("meal") as MealType) || "breakfast";

  const { user, loading: authLoading } = useAuth();
  const { addFood } = useDailyLog();

  const [query, setQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const [results, setResults] = useState<USDASearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Debounced search handler
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchFoods(query);
        setResults(data);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleQuickChipClick = (item: string) => {
    setQuery(item);
  };

  const handleLog = useCallback(
    async (meal: MealType, foodEntry: any) => {
      await addFood(meal, foodEntry);
    },
    [addFood]
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      {/* Search Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            {/* Target Meal Switcher */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-on-surface-variant font-medium">Log to:</span>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value as MealType)}
                className="font-bold bg-surface-variant text-primary rounded-lg px-2 py-1 border border-outline-variant/30 outline-none capitalize"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
          </div>

          <FoodSearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            isLoading={searching}
          />

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {POPULAR_QUERIES.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleQuickChipClick(item)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                  ${
                    query.toLowerCase() === item.toLowerCase()
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:border-primary/50"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Results Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 flex-1">
        {results.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium px-1">
              <span>Found {results.length} verified results</span>
              <span className="flex items-center gap-1 text-[11px] text-primary">
                <Sparkles className="w-3 h-3" /> USDA Database
              </span>
            </div>

            {results.map((food) => (
              <FoodResultCard
                key={food.fdcId}
                food={food}
                selectedMeal={selectedMeal}
                onLog={handleLog}
              />
            ))}
          </div>
        ) : hasSearched && !searching ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-bold text-on-surface">No foods found</p>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              We couldn&apos;t find matching items for &quot;{query}&quot;. Try searching for general terms like &quot;egg&quot; or &quot;apple&quot;.
            </p>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">
                Search verified foods
              </p>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto mt-0.5">
                Powered by USDA FoodData Central. Tap any quick suggestion above or type in any item.
              </p>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function FoodSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <FoodSearchContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeToDailyLog,
  addFoodToMeal,
  removeFoodFromMeal,
  createEmptyTotals,
} from "@/lib/firebase/firestore";
import { getToday } from "@/lib/utils/date";
import type { DailyLog, FoodEntry, MealType, NutritionTotals } from "@/types";

export function useDailyLog(initialDate?: string) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || "");

  useEffect(() => {
    if (!initialDate) {
      setSelectedDate(getToday());
    } else {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const [log, setLog] = useState<DailyLog>({
    id: "",
    userId: user?.uid || "",
    date: selectedDate || "1970-01-01",
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    totals: createEmptyTotals(),
    createdAt: "",
    updatedAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user || !selectedDate) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToDailyLog(
      user.uid,
      selectedDate,
      (updatedLog) => {
        setLog(updatedLog);
        setLoading(false);
      },
      (err) => {
        console.warn("Log subscription error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedDate]);

  const addFood = useCallback(
    async (mealType: MealType, food: Omit<FoodEntry, "id" | "addedAt">) => {
      const activeDate = selectedDate || getToday();
      if (!user) throw new Error("User must be logged in to add foods.");

      setIsSyncing(true);

      // Optimistic update
      const tempEntry: FoodEntry = {
        ...food,
        id: `temp_${Date.now()}`,
        addedAt: new Date().toISOString(),
      };

      setLog((prev) => {
        const nextMeals = {
          ...prev.meals,
          [mealType]: [...prev.meals[mealType], tempEntry],
        };
        return {
          ...prev,
          meals: nextMeals,
          totals: {
            calories: prev.totals.calories + food.calories,
            protein: prev.totals.protein + food.protein,
            carbs: prev.totals.carbs + food.carbs,
            fats: prev.totals.fats + food.fats,
            fiber: prev.totals.fiber + (food.fiber || 0),
            sodium: prev.totals.sodium + (food.sodium || 0),
            sugar: prev.totals.sugar + (food.sugar || 0),
          },
        };
      });

      try {
        const result = await addFoodToMeal(user.uid, activeDate, mealType, food);
        setLog(result);
        return result;
      } finally {
        setIsSyncing(false);
      }
    },
    [user, selectedDate]
  );

  const removeFood = useCallback(
    async (mealType: MealType, foodId: string) => {
      const activeDate = selectedDate || getToday();
      if (!user) return;
      setIsSyncing(true);

      // Optimistic local update
      setLog((prev) => {
        const removedItem = prev.meals[mealType].find((f) => f.id === foodId);
        if (!removedItem) return prev;

        const nextMeals = {
          ...prev.meals,
          [mealType]: prev.meals[mealType].filter((f) => f.id !== foodId),
        };

        return {
          ...prev,
          meals: nextMeals,
          totals: {
            calories: Math.max(0, prev.totals.calories - removedItem.calories),
            protein: Math.max(0, prev.totals.protein - removedItem.protein),
            carbs: Math.max(0, prev.totals.carbs - removedItem.carbs),
            fats: Math.max(0, prev.totals.fats - removedItem.fats),
            fiber: Math.max(0, prev.totals.fiber - (removedItem.fiber || 0)),
            sodium: Math.max(0, prev.totals.sodium - (removedItem.sodium || 0)),
            sugar: Math.max(0, prev.totals.sugar - (removedItem.sugar || 0)),
          },
        };
      });

      try {
        const result = await removeFoodFromMeal(user.uid, activeDate, mealType, foodId);
        setLog(result);
      } finally {
        setIsSyncing(false);
      }
    },
    [user, selectedDate]
  );

  return {
    log,
    totals: log.totals,
    loading,
    isSyncing,
    selectedDate: selectedDate || "",
    setSelectedDate,
    addFood,
    removeFood,
  };
}

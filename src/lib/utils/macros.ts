import type { MacroGoals } from "@/types";

/** Calories per gram for each macro */
const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const;

/**
 * Convert percentage-based macro goals to grams based on calorie budget
 */
export function percentageToGrams(
  calorieGoal: number,
  proteinPct: number,
  carbsPct: number,
  fatsPct: number
): { protein: number; carbs: number; fats: number } {
  return {
    protein: Math.round((calorieGoal * (proteinPct / 100)) / CALORIES_PER_GRAM.protein),
    carbs: Math.round((calorieGoal * (carbsPct / 100)) / CALORIES_PER_GRAM.carbs),
    fats: Math.round((calorieGoal * (fatsPct / 100)) / CALORIES_PER_GRAM.fats),
  };
}

/**
 * Convert gram-based goals to percentages
 */
export function gramsToPercentage(
  calorieGoal: number,
  proteinG: number,
  carbsG: number,
  fatsG: number
): { protein: number; carbs: number; fats: number } {
  const totalCals =
    proteinG * CALORIES_PER_GRAM.protein +
    carbsG * CALORIES_PER_GRAM.carbs +
    fatsG * CALORIES_PER_GRAM.fats;
  return {
    protein: Math.round(((proteinG * CALORIES_PER_GRAM.protein) / totalCals) * 100),
    carbs: Math.round(((carbsG * CALORIES_PER_GRAM.carbs) / totalCals) * 100),
    fats: Math.round(((fatsG * CALORIES_PER_GRAM.fats) / totalCals) * 100),
  };
}

/**
 * Get default macro split (balanced)
 */
export function getDefaultMacros(calorieGoal: number): MacroGoals {
  return {
    mode: "percentage",
    protein: 30,
    carbs: 40,
    fats: 30,
  };
}

/**
 * Get macro targets in grams for a given goal
 */
export function getMacroTargetsInGrams(
  calorieGoal: number,
  goals: MacroGoals
): { protein: number; carbs: number; fats: number } {
  if (goals.mode === "grams") {
    return {
      protein: goals.protein,
      carbs: goals.carbs,
      fats: goals.fats,
    };
  }
  return percentageToGrams(calorieGoal, goals.protein, goals.carbs, goals.fats);
}

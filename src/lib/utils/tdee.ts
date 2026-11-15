import type { ActivityLevel, WeightGoal } from "@/types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * Men: 10 × weight(kg) + 6.25 × height(cm) – 5 × age + 5
 * Women: 10 × weight(kg) + 6.25 × height(cm) – 5 × age – 161
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  sex: "male" | "female"
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/**
 * Calculate TDEE from BMR and activity level
 */
export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  sex: "male" | "female",
  activityLevel: ActivityLevel
): number {
  const bmr = calculateBMR(weight, height, age, sex);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Adjust TDEE based on weight goal
 * Lose: -500 kcal/day (≈1 lb/week)
 * Gain: +300 kcal/day (lean gain)
 * Maintain: no change
 */
export function calculateCalorieGoal(
  tdee: number,
  goal: WeightGoal
): number {
  switch (goal) {
    case "lose":
      return Math.max(1200, tdee - 500); // Floor at 1200 for safety
    case "gain":
      return tdee + 300;
    case "maintain":
    default:
      return tdee;
  }
}

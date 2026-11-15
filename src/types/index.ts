// User profile from onboarding
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  sex: "male" | "female";
  activityLevel: ActivityLevel;
  tdee: number; // calculated
  calorieGoal: number; // calculated target based on goal
  goal: WeightGoal;
  isPremium: boolean;
  macroGoals?: MacroGoals;
  calorieCycling?: CalorieCycling;
  createdAt: string; // ISO string
  updatedAt: string;
}

export type ActivityLevel =
  | "sedentary" // 1.2
  | "light" // 1.375
  | "moderate" // 1.55
  | "active" // 1.725
  | "very_active"; // 1.9

export type WeightGoal = "lose" | "maintain" | "gain";

// Macro goals (premium feature)
export interface MacroGoals {
  mode: "percentage" | "grams";
  protein: number; // percentage or grams
  carbs: number;
  fats: number;
}

// Calorie cycling (premium feature)
export interface CalorieCycling {
  enabled: boolean;
  schedule: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

// Daily food log
export interface DailyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snacks: FoodEntry[];
  };
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

// Individual food entry
export interface FoodEntry {
  id: string;
  fdcId?: number; // USDA FDC ID
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  source: "usda" | "manual" | "ai_scan";
  addedAt: string;
}

// Aggregated nutrition totals
export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

// Weight history entry
export interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  date: string;
  note?: string;
  createdAt: string;
}

// USDA API response types
export interface USDASearchResult {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

// Gemini Vision API response
export interface AIFoodScanResult {
  food_items: string[];
  estimated_calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  confidence?: number;
}

// Onboarding form data
export interface OnboardingFormData {
  age: number;
  weight: number;
  height: number;
  sex: "male" | "female";
  activityLevel: ActivityLevel;
  goal: WeightGoal;
}

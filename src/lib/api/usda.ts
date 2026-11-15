import type { FoodEntry, USDASearchResult } from "@/types";

/**
 * Extract nutrient value by name / ID from USDA foodNutrients array
 */
export function extractNutrient(
  nutrients: USDASearchResult["foodNutrients"],
  names: string[],
  ids: number[] = []
): number {
  const match = nutrients.find(
    (n) =>
      ids.includes(n.nutrientId) ||
      names.some((name) =>
        n.nutrientName.toLowerCase().includes(name.toLowerCase())
      )
  );
  return match ? Math.round(match.value * 10) / 10 : 0;
}

/**
 * Convert a USDASearchResult into a ready-to-log FoodEntry
 */
export function usdaResultToFoodEntry(
  item: USDASearchResult,
  multiplier = 1
): Omit<FoodEntry, "id" | "addedAt"> {
  const rawCalories = extractNutrient(
    item.foodNutrients,
    ["energy"],
    [1008, 2047, 2048]
  );
  const rawProtein = extractNutrient(
    item.foodNutrients,
    ["protein"],
    [1003]
  );
  const rawCarbs = extractNutrient(
    item.foodNutrients,
    ["carbohydrate"],
    [1005]
  );
  const rawFats = extractNutrient(
    item.foodNutrients,
    ["total lipid", "fat"],
    [1004]
  );
  const rawFiber = extractNutrient(
    item.foodNutrients,
    ["fiber"],
    [1079]
  );
  const rawSodium = extractNutrient(
    item.foodNutrients,
    ["sodium"],
    [1093]
  );
  const rawSugar = extractNutrient(
    item.foodNutrients,
    ["sugar", "sugars"],
    [2000, 1235]
  );

  const baseServing = item.servingSize || 100;
  const servingSize = Math.round(baseServing * multiplier);

  return {
    fdcId: item.fdcId,
    name: item.description,
    brand: item.brandName,
    servingSize,
    servingUnit: item.servingSizeUnit || "g",
    quantity: multiplier,
    calories: Math.round(rawCalories * multiplier),
    protein: Math.round(rawProtein * multiplier * 10) / 10,
    carbs: Math.round(rawCarbs * multiplier * 10) / 10,
    fats: Math.round(rawFats * multiplier * 10) / 10,
    fiber: Math.round(rawFiber * multiplier * 10) / 10,
    sodium: Math.round(rawSodium * multiplier),
    sugar: Math.round(rawSugar * multiplier * 10) / 10,
    source: "usda",
  };
}

/**
 * Search USDA foods via internal proxy API
 */
export async function searchFoods(query: string): Promise<USDASearchResult[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search request failed");
    const data = await res.json();
    return data.foods || [];
  } catch (error) {
    console.error("Food search error:", error);
    return [];
  }
}

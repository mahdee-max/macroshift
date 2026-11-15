import { NextResponse } from "next/server";
import type { USDASearchResult, USDANutrient } from "@/types";

// Curated high-accuracy food database fallback
const FALLBACK_FOODS: USDASearchResult[] = [
  {
    fdcId: 10001,
    description: "Chicken Breast, boneless, skinless, cooked",
    brandName: "Whole Foods",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 165, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 31, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 0, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 3.6, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 0, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 74, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 0, unitName: "g" },
    ],
  },
  {
    fdcId: 10002,
    description: "Whole Egg, large, cooked",
    brandName: "Farm Fresh",
    servingSize: 50,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 74, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 6.3, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 0.4, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 5, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 0, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 70, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 0.2, unitName: "g" },
    ],
  },
  {
    fdcId: 10003,
    description: "White Rice, long-grain, cooked",
    servingSize: 150,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 195, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 4.1, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 42, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 0.4, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 0.6, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 2, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 0.1, unitName: "g" },
    ],
  },
  {
    fdcId: 10004,
    description: "Rolled Oats, raw whole grain",
    brandName: "Quaker",
    servingSize: 40,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 150, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 5, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 27, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 3, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 4, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 0, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 1, unitName: "g" },
    ],
  },
  {
    fdcId: 10005,
    description: "Greek Yogurt, plain, nonfat",
    brandName: "Chobani",
    servingSize: 170,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 100, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 18, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 6, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 0.7, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 0, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 60, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 5, unitName: "g" },
    ],
  },
  {
    fdcId: 10006,
    description: "Salmon Fillet, Atlantic, cooked",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 206, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 22, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 0, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 12.3, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 0, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 61, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 0, unitName: "g" },
    ],
  },
  {
    fdcId: 10007,
    description: "Avocado, fresh",
    servingSize: 100,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 160, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 2, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 8.5, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 14.7, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 6.7, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 7, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 0.7, unitName: "g" },
    ],
  },
  {
    fdcId: 10008,
    description: "Banana, ripe, raw",
    servingSize: 118,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 105, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 1.3, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 27, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 0.3, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 3.1, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 1, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 14, unitName: "g" },
    ],
  },
  {
    fdcId: 10009,
    description: "Whey Protein Isolate Powder",
    brandName: "Optimum Nutrition",
    servingSize: 30,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 120, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 24, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 3, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 1, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 0, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 130, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 1, unitName: "g" },
    ],
  },
  {
    fdcId: 10010,
    description: "Peanut Butter, creamy",
    brandName: "Jif",
    servingSize: 32,
    servingSizeUnit: "g",
    foodNutrients: [
      { nutrientId: 1008, nutrientName: "Energy", value: 190, unitName: "kcal" },
      { nutrientId: 1003, nutrientName: "Protein", value: 8, unitName: "g" },
      { nutrientId: 1005, nutrientName: "Carbohydrate, by difference", value: 7, unitName: "g" },
      { nutrientId: 1004, nutrientName: "Total lipid (fat)", value: 16, unitName: "g" },
      { nutrientId: 1079, nutrientName: "Fiber, total dietary", value: 2, unitName: "g" },
      { nutrientId: 1093, nutrientName: "Sodium, Na", value: 140, unitName: "mg" },
      { nutrientId: 2000, nutrientName: "Sugars, total including NLEA", value: 3, unitName: "g" },
    ],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ foods: [] });
  }

  const apiKey = process.env.USDA_API_KEY;

  if (apiKey && apiKey !== "your_usda_api_key") {
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        query
      )}&pageSize=20&api_key=${apiKey}`;

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        const results: USDASearchResult[] = (data.foods || []).map((f: any) => ({
          fdcId: f.fdcId,
          description: f.description,
          brandName: f.brandName || f.brandOwner,
          brandOwner: f.brandOwner,
          servingSize: f.servingSize || 100,
          servingSizeUnit: f.servingSizeUnit || "g",
          foodNutrients: (f.foodNutrients || []).map((n: any) => ({
            nutrientId: n.nutrientId,
            nutrientName: n.nutrientName,
            value: n.value,
            unitName: n.unitName,
          })),
        }));

        return NextResponse.json({ foods: results });
      }
    } catch (err) {
      console.warn("USDA API call failed, falling back to local dataset:", err);
    }
  }

  // Local fallback search (case-insensitive fuzzy match)
  const lowerQ = query.toLowerCase();
  const matched = FALLBACK_FOODS.filter((item) =>
    item.description.toLowerCase().includes(lowerQ) ||
    item.brandName?.toLowerCase().includes(lowerQ)
  );

  return NextResponse.json({ foods: matched.length > 0 ? matched : FALLBACK_FOODS });
}

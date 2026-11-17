import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import type {
  DailyLog,
  FoodEntry,
  MealType,
  NutritionTotals,
  UserProfile,
  WeightEntry,
} from "@/types";

/**
 * Empty initial totals
 */
export function createEmptyTotals(): NutritionTotals {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sodium: 0,
    sugar: 0,
  };
}

/**
 * Calculate totals for a given daily log's meals
 */
export function calculateTotals(meals: DailyLog["meals"]): NutritionTotals {
  const allEntries: FoodEntry[] = [
    ...meals.breakfast,
    ...meals.lunch,
    ...meals.dinner,
    ...meals.snacks,
  ];

  return allEntries.reduce(
    (acc, item) => ({
      calories: Math.round(acc.calories + (item.calories || 0)),
      protein: Math.round(acc.protein + (item.protein || 0)),
      carbs: Math.round(acc.carbs + (item.carbs || 0)),
      fats: Math.round(acc.fats + (item.fats || 0)),
      fiber: Math.round(acc.fiber + (item.fiber || 0)),
      sodium: Math.round(acc.sodium + (item.sodium || 0)),
      sugar: Math.round(acc.sugar + (item.sugar || 0)),
    }),
    createEmptyTotals()
  );
}

export function getDailyLogDocId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

// In-memory / localStorage listeners for offline dev mode
const logListeners: Map<string, Set<(log: DailyLog) => void>> = new Map();

function notifyLogListeners(key: string, log: DailyLog) {
  const set = logListeners.get(key);
  if (set) {
    set.forEach((cb) => cb(log));
  }
}

/**
 * Fetch a daily log for a specific date
 */
export async function getDailyLog(
  userId: string,
  date: string
): Promise<DailyLog> {
  const docId = getDailyLogDocId(userId, date);

  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`macroshift_log_${docId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {
      id: docId,
      userId,
      date,
      meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      totals: createEmptyTotals(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const docRef = doc(db, "daily_logs", docId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data() as DailyLog;
  }

  return {
    id: docId,
    userId,
    date,
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    totals: createEmptyTotals(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Subscribe to real-time daily log changes
 */
export function subscribeToDailyLog(
  userId: string,
  date: string,
  onData: (log: DailyLog) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docId = getDailyLogDocId(userId, date);

  if (!isFirebaseConfigured) {
    const key = `macroshift_log_${docId}`;
    if (!logListeners.has(key)) {
      logListeners.set(key, new Set());
    }
    logListeners.get(key)!.add(onData);

    // Initial read
    getDailyLog(userId, date).then(onData);

    return () => {
      logListeners.get(key)?.delete(onData);
    };
  }

  const docRef = doc(db, "daily_logs", docId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as DailyLog);
      } else {
        onData({
          id: docId,
          userId,
          date,
          meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
          totals: createEmptyTotals(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    },
    (error) => {
      console.warn("Firestore subscription error (offline fallback):", error);
      if (onError) onError(error);
    }
  );
}

/**
 * Add a food item to a specific meal in a daily log
 */
export async function addFoodToMeal(
  userId: string,
  date: string,
  mealType: MealType,
  food: Omit<FoodEntry, "id" | "addedAt">
): Promise<DailyLog> {
  const docId = getDailyLogDocId(userId, date);
  const currentLog = await getDailyLog(userId, date);

  const newEntry: FoodEntry = {
    ...food,
    id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    addedAt: new Date().toISOString(),
  };

  const updatedMeals = {
    ...currentLog.meals,
    [mealType]: [...currentLog.meals[mealType], newEntry],
  };

  const updatedTotals = calculateTotals(updatedMeals);

  const updatedLog: DailyLog = {
    ...currentLog,
    meals: updatedMeals,
    totals: updatedTotals,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      const key = `macroshift_log_${docId}`;
      localStorage.setItem(key, JSON.stringify(updatedLog));
      notifyLogListeners(key, updatedLog);
    }
    return updatedLog;
  }

  const docRef = doc(db, "daily_logs", docId);
  await setDoc(docRef, updatedLog, { merge: true });
  return updatedLog;
}

/**
 * Remove a food item from a meal in a daily log
 */
export async function removeFoodFromMeal(
  userId: string,
  date: string,
  mealType: MealType,
  foodId: string
): Promise<DailyLog> {
  const docId = getDailyLogDocId(userId, date);
  const currentLog = await getDailyLog(userId, date);

  const updatedMeals = {
    ...currentLog.meals,
    [mealType]: currentLog.meals[mealType].filter((item) => item.id !== foodId),
  };

  const updatedTotals = calculateTotals(updatedMeals);

  const updatedLog: DailyLog = {
    ...currentLog,
    meals: updatedMeals,
    totals: updatedTotals,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      const key = `macroshift_log_${docId}`;
      localStorage.setItem(key, JSON.stringify(updatedLog));
      notifyLogListeners(key, updatedLog);
    }
    return updatedLog;
  }

  const docRef = doc(db, "daily_logs", docId);
  await setDoc(docRef, updatedLog, { merge: true });
  return updatedLog;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      const key = `macroshift_profile_${userId}`;
      const raw = localStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : {};
      const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(updated));
    }
    return;
  }

  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Save complete user profile on onboarding
 */
export async function saveUserProfile(
  userId: string,
  profile: UserProfile
): Promise<void> {
  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`macroshift_profile_${userId}`, JSON.stringify(profile));
    }
    return;
  }

  const docRef = doc(db, "users", userId);
  await setDoc(docRef, profile, { merge: true });
}

/**
 * Log weight entry to weight_history
 */
export async function addWeightEntry(
  userId: string,
  weight: number,
  date: string,
  note?: string
): Promise<WeightEntry> {
  const entryId = `weight_${userId}_${date}_${Date.now()}`;
  const entry: WeightEntry = {
    id: entryId,
    userId,
    weight,
    date,
    note,
    createdAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      const key = `macroshift_weight_${userId}`;
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      localStorage.setItem(key, JSON.stringify(list));
    }
    await updateUserProfile(userId, { weight });
    return entry;
  }

  const docRef = doc(db, "weight_history", entryId);
  await setDoc(docRef, entry);
  await updateUserProfile(userId, { weight });
  return entry;
}

/**
 * Get recent weight history
 */
export async function getWeightHistory(
  userId: string,
  limitCount = 30
): Promise<WeightEntry[]> {
  if (!isFirebaseConfigured) {
    if (typeof window !== "undefined") {
      const key = `macroshift_weight_${userId}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw).slice(0, limitCount) : [];
    }
    return [];
  }

  try {
    const q = query(
      collection(db, "weight_history"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => docSnap.data() as WeightEntry);
  } catch (err) {
    console.warn("Could not fetch weight history:", err);
    return [];
  }
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveUserProfile } from "@/lib/firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculateTDEE, calculateCalorieGoal } from "@/lib/utils/tdee";
import { getDefaultMacros, getMacroTargetsInGrams } from "@/lib/utils/macros";
import type { ActivityLevel, WeightGoal, UserProfile } from "@/types";
import {
  User,
  Activity,
  Target,
  Flame,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const STEPS = ["Basics", "Body", "Activity", "Goal", "Plan"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, loading, setUserProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(28);

  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [rawWeight, setRawWeight] = useState<number>(75);

  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [rawHeight, setRawHeight] = useState<number>(178);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<WeightGoal>("lose");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (userProfile) {
      router.replace("/dashboard");
    }
  }, [user, userProfile, loading, router]);

  // Derived normalized metric values
  const weightKg =
    weightUnit === "kg"
      ? Number(rawWeight)
      : Math.round(Number(rawWeight) * 0.45359237);

  const heightCm =
    heightUnit === "cm"
      ? Number(rawHeight)
      : Math.round((Number(heightFt) * 12 + Number(heightIn)) * 2.54);

  const tdee = calculateTDEE(weightKg, heightCm, Number(age), sex, activityLevel);
  const calorieGoal = calculateCalorieGoal(tdee, goal);
  const defaultMacros = getDefaultMacros(calorieGoal);
  const macroGrams = getMacroTargetsInGrams(calorieGoal, defaultMacros);

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 0 && (age < 13 || age > 100)) {
      setErrorMsg("Please enter a valid age between 13 and 100.");
      return;
    }
    if (step === 1 && (weightKg < 30 || weightKg > 350)) {
      setErrorMsg("Please enter a realistic weight.");
      return;
    }
    if (step === 1 && (heightCm < 90 || heightCm > 250)) {
      setErrorMsg("Please enter a realistic height.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);
    setErrorMsg(null);

    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Athlete",
      photoURL: user.photoURL || undefined,
      age: Number(age),
      weight: weightKg,
      height: heightCm,
      sex,
      activityLevel,
      tdee,
      calorieGoal,
      goal,
      isPremium: false,
      macroGoals: defaultMacros,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveUserProfile(user.uid, profile);
      setUserProfile(profile);
      router.replace("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to save profile:", err);
      // Offline fallback: set profile locally in state so user can proceed
      setUserProfile(profile);
      router.replace("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-primary">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">
            MacroShift Setup
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface mt-1">
          {step === 0 && "Tell us about yourself"}
          {step === 1 && "Your body measurements"}
          {step === 2 && "How active are you?"}
          {step === 3 && "What is your primary goal?"}
          {step === 4 && "Your personalized target"}
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          {step === 0 && "We calculate baseline metabolic rate using standard Mifflin-St Jeor formula."}
          {step === 1 && "Precision counts for accurate daily calorie targets."}
          {step === 2 && "Physical exertion drives total daily energy expenditure."}
          {step === 3 && "We calibrate safe caloric surplus or deficit based on your ambition."}
          {step === 4 && "Everything is calibrated and ready to start logging."}
        </p>
      </div>

      <Stepper steps={STEPS} currentStep={step} />

      {errorMsg && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-xs text-error font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 0: Basics */}
      {step === 0 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-2">
              Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "male", label: "Male" },
                { id: "female", label: "Female" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSex(item.id as "male" | "female")}
                  className={`
                    p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200
                    ${
                      sex === item.id
                        ? "border-primary bg-primary-container text-primary font-bold shadow-sm"
                        : "border-outline-variant/40 bg-surface-variant text-on-surface hover:border-outline"
                    }
                  `}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Age"
            type="number"
            min={13}
            max={100}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            helperText="Years old"
          />
        </div>
      )}

      {/* STEP 1: Body */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                Current Weight
              </label>
              <div className="inline-flex rounded-lg bg-surface-variant p-0.5 border border-outline-variant/30 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (weightUnit === "lbs") {
                      setRawWeight(Math.round(rawWeight * 0.45359237));
                      setWeightUnit("kg");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    weightUnit === "kg" ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (weightUnit === "kg") {
                      setRawWeight(Math.round(rawWeight * 2.20462));
                      setWeightUnit("lbs");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    weightUnit === "lbs" ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                >
                  lbs
                </button>
              </div>
            </div>
            <Input
              type="number"
              step="0.5"
              value={rawWeight}
              onChange={(e) => setRawWeight(Number(e.target.value))}
              trailingIcon={<Scale className="w-4 h-4 text-on-surface-variant" />}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                Height
              </label>
              <div className="inline-flex rounded-lg bg-surface-variant p-0.5 border border-outline-variant/30 text-xs">
                <button
                  type="button"
                  onClick={() => setHeightUnit("cm")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    heightUnit === "cm" ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit("ft")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    heightUnit === "ft" ? "bg-primary text-white" : "text-on-surface-variant"
                  }`}
                >
                  ft / in
                </button>
              </div>
            </div>

            {heightUnit === "cm" ? (
              <Input
                type="number"
                value={rawHeight}
                onChange={(e) => setRawHeight(Number(e.target.value))}
                helperText="Centimeters"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Feet"
                  type="number"
                  min={3}
                  max={8}
                  value={heightFt}
                  onChange={(e) => setHeightFt(Number(e.target.value))}
                />
                <Input
                  label="Inches"
                  type="number"
                  min={0}
                  max={11}
                  value={heightIn}
                  onChange={(e) => setHeightIn(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Activity Level */}
      {step === 2 && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          {[
            {
              id: "sedentary",
              title: "Sedentary",
              desc: "Little to no exercise, desk job",
              factor: "1.2x",
            },
            {
              id: "light",
              title: "Lightly Active",
              desc: "Light exercise 1-3 days per week",
              factor: "1.375x",
            },
            {
              id: "moderate",
              title: "Moderately Active",
              desc: "Moderate workouts 3-5 days per week",
              factor: "1.55x",
            },
            {
              id: "active",
              title: "Very Active",
              desc: "Heavy exercise 6-7 days per week",
              factor: "1.725x",
            },
            {
              id: "very_active",
              title: "Extremely Active",
              desc: "Athletic training or strenuous physical labor",
              factor: "1.9x",
            },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActivityLevel(item.id as ActivityLevel)}
              className={`
                w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between
                ${
                  activityLevel === item.id
                    ? "border-primary bg-primary-container text-primary font-medium shadow-xs"
                    : "border-outline-variant/30 bg-surface-variant text-on-surface hover:border-outline"
                }
              `}
            >
              <div>
                <p className="text-sm font-bold leading-tight">{item.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-md bg-surface text-on-surface shrink-0 ml-3">
                {item.factor}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 3: Goal */}
      {step === 3 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {[
            {
              id: "lose",
              title: "Lose Weight",
              desc: "-500 kcal deficit per day (~0.5 kg / 1 lb fat loss per week)",
              icon: Target,
            },
            {
              id: "maintain",
              title: "Maintain Weight",
              desc: "Exact energy equilibrium to maintain current body mass",
              icon: Scale,
            },
            {
              id: "gain",
              title: "Gain Muscle / Bulk",
              desc: "+300 kcal lean surplus to promote hypertrophic growth",
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = goal === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setGoal(item.id as WeightGoal)}
                className={`
                  w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5
                  ${
                    isSelected
                      ? "border-primary bg-primary-container text-primary shadow-xs"
                      : "border-outline-variant/30 bg-surface-variant text-on-surface hover:border-outline"
                  }
                `}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? "bg-primary text-white" : "bg-surface text-on-surface-variant"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 4: Results Plan */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Flame className="w-4 h-4" /> Daily Calorie Budget
            </span>
            <div className="text-4xl font-extrabold text-on-surface tracking-tight mt-1">
              {calorieGoal.toLocaleString()}{" "}
              <span className="text-base font-semibold text-on-surface-variant">kcal</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Based on your estimated TDEE of {tdee.toLocaleString()} kcal
            </p>
          </div>

          <div className="bg-surface-variant rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Recommended Daily Macronutrients (Balanced 30/40/30)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-surface rounded-xl p-2.5 border border-outline-variant/30">
                <span className="text-xs font-semibold text-primary block">Protein</span>
                <span className="text-lg font-bold text-on-surface">{macroGrams.protein}g</span>
                <span className="text-[10px] text-on-surface-variant block">30%</span>
              </div>
              <div className="bg-surface rounded-xl p-2.5 border border-outline-variant/30">
                <span className="text-xs font-semibold text-secondary block">Carbs</span>
                <span className="text-lg font-bold text-on-surface">{macroGrams.carbs}g</span>
                <span className="text-[10px] text-on-surface-variant block">40%</span>
              </div>
              <div className="bg-surface rounded-xl p-2.5 border border-outline-variant/30">
                <span className="text-xs font-semibold text-tertiary block">Fats</span>
                <span className="text-lg font-bold text-on-surface">{macroGrams.fats}g</span>
                <span className="text-[10px] text-on-surface-variant block">30%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-secondary font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Fully offline compatible. You can change these targets anytime in Settings.</span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/30">
        {step > 0 ? (
          <Button
            type="button"
            variant="outlined"
            onClick={handleBack}
            leadingIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            trailingIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            loading={submitting}
            onClick={handleFinish}
            trailingIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Start Tracking
          </Button>
        )}
      </div>
    </div>
  );
}

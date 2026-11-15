"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePremium } from "@/context/PremiumContext";
import { useCamera } from "@/lib/hooks/useCamera";
import { useDailyLog } from "@/lib/hooks/useDailyLog";
import { analyzeMealImage } from "@/lib/api/gemini";
import { ScanResultModal } from "@/components/camera/ScanResultModal";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import {
  Camera,
  RotateCcw,
  Upload,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import type { AIFoodScanResult, MealType, FoodEntry } from "@/types";

function SmartCameraContent() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { isPremium, togglePremium } = usePremium();
  const { addFood } = useDailyLog();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    videoRef,
    isStreaming,
    error: cameraError,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
  } = useCamera();

  const [analyzing, setAnalyzing] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<AIFoodScanResult | null>(null);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Start camera on mount if premium
  useEffect(() => {
    if (isPremium) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isPremium, startCamera, stopCamera]);

  const handleCapture = async () => {
    if (analyzing) return;
    const photoBase64 = capturePhoto();
    if (!photoBase64) return;

    setCapturedPreview(photoBase64);
    await processImage(photoBase64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCapturedPreview(base64);
        await processImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Image: string) => {
    setAnalyzing(true);
    try {
      const response = await analyzeMealImage(base64Image);
      setScanResult(response.result);
      setIsDemoResult(!!response.isDemo);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Meal scan error:", err);
      // Fallback modal open
      setScanResult({
        food_items: ["Balanced Meal Plate"],
        estimated_calories: 450,
        macros: { protein: 30, carbs: 45, fats: 14 },
      });
      setIsDemoResult(true);
      setIsModalOpen(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmLog = async (
    mealType: MealType,
    entry: Omit<FoodEntry, "id" | "addedAt">
  ) => {
    await addFood(mealType, entry);
    router.push("/dashboard");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-20 select-none">
      {/* Top Overlay Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <Link
          href="/dashboard"
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-tertiary" />
          <span>Smart Camera</span>
        </div>

        <button
          type="button"
          onClick={toggleFacingMode}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
          aria-label="Switch camera"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Main Viewfinder Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Live video feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover ${
            isStreaming ? "block" : "hidden"
          }`}
        />

        {/* Fallback Viewfinder if camera not streaming */}
        {!isStreaming && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white/80" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {cameraError ? "Camera Access Needed" : "Ready to Scan"}
              </h2>
              <p className="text-xs text-white/60 mt-1">
                {cameraError ||
                  "Point your camera at any food plate, grocery item, or restaurant meal to analyze nutrition automatically."}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full pt-2">
              <Button
                onClick={() => startCamera()}
                leadingIcon={<Camera className="w-4 h-4" />}
              >
                Enable Camera
              </Button>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                leadingIcon={<Upload className="w-4 h-4" />}
                className="text-white border-white/30"
              >
                Upload from Gallery
              </Button>
            </div>
          </div>
        )}

        {/* Scanner Framing Reticle */}
        {isStreaming && !analyzing && (
          <div className="absolute inset-x-8 inset-y-24 pointer-events-none border-2 border-white/30 rounded-3xl flex flex-col justify-between p-4">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-3 border-l-3 border-primary rounded-tl-xl" />
              <div className="w-6 h-6 border-t-3 border-r-3 border-primary rounded-tr-xl" />
            </div>
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white/90">
                Fit meal inside frame
              </span>
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-3 border-l-3 border-primary rounded-bl-xl" />
              <div className="w-6 h-6 border-b-3 border-r-3 border-primary rounded-br-xl" />
            </div>
          </div>
        )}

        {/* Analyzing / Scanning Animation Overlay */}
        {analyzing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 animate-in fade-in duration-200">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <Sparkles className="w-6 h-6 text-tertiary absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm font-bold text-white tracking-wide">
              Analyzing with Gemini Vision...
            </p>
            <p className="text-xs text-white/60">
              Identifying ingredients and calculating macros
            </p>
          </div>
        )}

        {/* Hidden File Input for fallback uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Premium Lock Overlay if not premium */}
      {!isPremium && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-tertiary/20 text-tertiary flex items-center justify-center mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black">AI Meal Scanner is PRO</h2>
          <p className="text-xs text-white/70 max-w-xs mt-1 mb-5">
            Log whole meals in 2 seconds with multimodal visual intelligence powered by Google Gemini.
          </p>
          <Button
            onClick={() => {
              togglePremium();
              startCamera();
            }}
            leadingIcon={<Sparkles className="w-4 h-4" />}
            className="w-full max-w-xs"
          >
            Unlock Free Pro Trial
          </Button>
          <Link
            href="/dashboard"
            className="text-xs text-white/50 hover:text-white mt-4"
          >
            Return to Dashboard
          </Link>
        </div>
      )}

      {/* Bottom Controls Bar */}
      {isPremium && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-around px-8">
          {/* Gallery Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95"
            aria-label="Upload photo"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            disabled={analyzing}
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 transition-all active:scale-90 shadow-xl"
            aria-label="Take picture"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-primary transition-colors flex items-center justify-center">
              <Camera className="w-7 h-7 text-black hover:text-white transition-colors" />
            </div>
          </button>

          {/* Preset trigger button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 opacity-0 pointer-events-none"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Confirm Logging Modal */}
      <ScanResultModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCapturedPreview(null);
        }}
        scanResult={scanResult}
        imagePreviewUrl={capturedPreview}
        isDemo={isDemoResult}
        onConfirmLog={handleConfirmLog}
      />
    </div>
  );
}

export default function SmartCameraPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SmartCameraContent />
    </Suspense>
  );
}

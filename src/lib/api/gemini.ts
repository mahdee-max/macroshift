import type { AIFoodScanResult } from "@/types";

export async function analyzeMealImage(
  imageBase64: string,
  mimeType = "image/jpeg"
): Promise<{ result: AIFoodScanResult; isDemo?: boolean }> {
  const response = await fetch("/api/ai/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to analyze image with AI");
  }

  return response.json();
}

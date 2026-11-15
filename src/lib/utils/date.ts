/**
 * Get today's date as YYYY-MM-DD string
 */
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get day of week name from a date string
 */
export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as string;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

/**
 * Get an array of the last N days as YYYY-MM-DD strings
 */
export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }
  return days;
}

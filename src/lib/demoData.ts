import { MonkeyTypeResult } from "./types";

/**
 * Generate a realistic-looking history of typing tests for demo mode.
 * Simulates gradual improvement over ~90 days with natural variance.
 */
export function generateDemoResults(): MonkeyTypeResult[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Simulate 90 days of practice, ~4 tests per day on average
  const totalDays = 90;
  const results: MonkeyTypeResult[] = [];

  // Start at ~105 WPM, progress toward ~140 with natural wobble
  const startWpm = 105;
  const endWpm = 140;

  for (let day = totalDays; day >= 0; day--) {
    const testsToday = Math.floor(Math.random() * 6) + 1; // 1-6 tests
    const dayProgress = (totalDays - day) / totalDays; // 0 → 1

    // Base WPM for this day with smooth improvement
    const baseWpm = startWpm + (endWpm - startWpm) * dayProgress;

    for (let t = 0; t < testsToday; t++) {
      // Natural variance: ±10 WPM around the day's mean
      const variance = (Math.random() - 0.5) * 20;
      const wpm = Math.max(60, Math.round((baseWpm + variance) * 100) / 100);

      // Accuracy trends up slightly over time, 92-99%
      const accBase = 94 + dayProgress * 3;
      const acc =
        Math.round(
          Math.max(88, Math.min(100, accBase + (Math.random() - 0.5) * 5)) * 100
        ) / 100;

      // Consistency similar trend, 70-90%
      const consBase = 74 + dayProgress * 10;
      const consistency =
        Math.round(
          Math.max(60, Math.min(95, consBase + (Math.random() - 0.5) * 12)) *
            100
        ) / 100;

      // Timestamp: random time during this day
      const timestamp = now - day * dayMs + Math.random() * dayMs;

      results.push({
        wpm,
        acc,
        consistency,
        rawWpm: Math.round((wpm * 1.03 + Math.random() * 2) * 100) / 100,
        mode: "time",
        mode2: "30",
        timestamp,
        language: "english",
      });
    }
  }

  return results;
}

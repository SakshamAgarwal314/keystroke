import { MonkeyTypeResult } from "./types";

/**
 * Simple seeded PRNG (Mulberry32 variant).
 * Returns deterministic pseudo-random numbers in [0, 1).
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return function () {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a realistic-looking history of typing tests for demo mode.
 * Simulates gradual improvement over ~90 days with natural variance.
 */
export function generateDemoResults(): MonkeyTypeResult[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Use fixed seed for reproducible demo data
  const random = seededRandom(42);

  // Simulate 90 days of practice, ~4 tests per day on average
  const totalDays = 90;
  const results: MonkeyTypeResult[] = [];

  // Start at ~105 WPM, progress toward ~140 with natural wobble
  const startWpm = 105;
  const endWpm = 140;

  for (let day = totalDays; day >= 0; day--) {
    const testsToday = Math.floor(random() * 6) + 1; // 1-6 tests
    const dayProgress = (totalDays - day) / totalDays; // 0 → 1

    // Base WPM for this day with smooth improvement
    const baseWpm = startWpm + (endWpm - startWpm) * dayProgress;

    for (let t = 0; t < testsToday; t++) {
      // Natural variance: ±10 WPM around the day's mean
      const variance = (random() - 0.5) * 20;
      const wpm = Math.max(60, Math.round((baseWpm + variance) * 100) / 100);

      // Accuracy trends up slightly over time, 92-99%
      const accBase = 94 + dayProgress * 3;
      const acc =
        Math.round(
          Math.max(88, Math.min(100, accBase + (random() - 0.5) * 5)) * 100
        ) / 100;

      // Consistency similar trend, 70-90%
      const consBase = 74 + dayProgress * 10;
      const consistency =
        Math.round(
          Math.max(60, Math.min(95, consBase + (random() - 0.5) * 12)) *
            100
        ) / 100;

      // Timestamp: random time during this day
      const timestamp = now - day * dayMs + random() * dayMs;

      results.push({
        wpm,
        acc,
        consistency,
        rawWpm: Math.round((wpm * 1.03 + random() * 2) * 100) / 100,
        mode: "time",
        mode2: "30",
        timestamp,
        language: "english",
      });
    }
  }

  return results;
}

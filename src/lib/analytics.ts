import {
  MonkeyTypeResult,
  KPIs,
  DailyStat,
  ChartDataPoint,
  DashboardData,
  PersonalRecord,
  StreakDay,
  RawCleanPoint,
} from "./types";

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map((v) => (v - avg) ** 2);
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / (arr.length - 1));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateKPIs(
  results: MonkeyTypeResult[],
  goalWpm: number
): KPIs {
  const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);

  const wpms = sorted.map((r) => r.wpm);
  const accuracies = sorted.map((r) => r.acc);
  const consistencies = sorted.map((r) => r.consistency).filter((c) => c > 0);

  const avgWpm = mean(wpms);
  const medianWpm = median(wpms);
  const stdDev = stdev(wpms);

  const sortedWpms = [...wpms].sort((a, b) => b - a);
  const tenPercent = Math.max(1, Math.floor(wpms.length / 10));
  const top10Avg = mean(sortedWpms.slice(0, tenPercent));
  const bottom10Avg = mean(sortedWpms.slice(-tenPercent));

  const avgAccuracy = mean(accuracies);
  const avgConsistency = mean(consistencies);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recent7 = sorted.filter((r) => r.timestamp >= weekAgo);
  const recent30 = sorted.filter((r) => r.timestamp >= monthAgo);

  const rolling7 = recent7.length > 0 ? mean(recent7.map((r) => r.wpm)) : 0;
  const rolling30 = recent30.length > 0 ? mean(recent30.map((r) => r.wpm)) : 0;

  const nearGoalThreshold = goalWpm - 10;
  const testsAboveGoal = wpms.filter((w) => w >= goalWpm).length;
  const testsNearGoal = wpms.filter((w) => w >= nearGoalThreshold).length;

  let improvementRate = 0;
  if (recent30.length >= 10) {
    const firstHalf = recent30.slice(Math.floor(recent30.length / 2));
    const secondHalf = recent30.slice(0, Math.floor(recent30.length / 2));
    const firstAvg = mean(firstHalf.map((r) => r.wpm));
    const secondAvg = mean(secondHalf.map((r) => r.wpm));
    improvementRate = secondAvg - firstAvg;
  }

  let estDays: number | null = null;
  let projectedDate: string | null = null;
  const distanceToGoal = goalWpm - avgWpm;
  if (improvementRate > 0 && distanceToGoal > 0) {
    const dailyRate = improvementRate / 30;
    estDays = Math.round(distanceToGoal / dailyRate);
    if (estDays > 0 && estDays < 365 * 3) {
      const projMs = Date.now() + estDays * 24 * 60 * 60 * 1000;
      projectedDate = new Date(projMs).toISOString();
    } else {
      estDays = null;
    }
  }

  return {
    average_wpm: round2(avgWpm),
    median_wpm: round2(medianWpm),
    std_deviation: round2(stdDev),
    top_10_percent_avg: round2(top10Avg),
    bottom_10_percent_avg: round2(bottom10Avg),
    personal_best: round2(Math.max(...wpms)),
    average_accuracy: round2(avgAccuracy),
    average_consistency: round2(avgConsistency),
    rolling_7_day_avg: round2(rolling7),
    rolling_30_day_avg: round2(rolling30),
    total_tests: results.length,
    tests_this_week: recent7.length,
    tests_this_month: recent30.length,
    goal_wpm: goalWpm,
    distance_to_goal: round2(distanceToGoal),
    tests_above_goal: testsAboveGoal,
    tests_near_goal: testsNearGoal,
    percent_near_goal: round2((testsNearGoal / wpms.length) * 100),
    improvement_rate_per_30_days: round2(improvementRate),
    estimated_days_to_goal: estDays,
    projected_goal_date: projectedDate,
  };
}

export function getDailyStats(results: MonkeyTypeResult[]): DailyStat[] {
  const grouped: Record<string, MonkeyTypeResult[]> = {};

  for (const r of results) {
    const date = new Date(r.timestamp).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(r);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tests]) => ({
      date,
      avg_wpm: round2(mean(tests.map((t) => t.wpm))),
      max_wpm: Math.max(...tests.map((t) => t.wpm)),
      min_wpm: Math.min(...tests.map((t) => t.wpm)),
      avg_acc: round2(mean(tests.map((t) => t.acc))),
      avg_consistency: round2(
        mean(tests.map((t) => t.consistency).filter((c) => c > 0))
      ),
      test_count: tests.length,
    }));
}

export function getChartData(results: MonkeyTypeResult[]): ChartDataPoint[] {
  return [...results]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      date: new Date(r.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      timestamp: r.timestamp,
      wpm: r.wpm,
      acc: r.acc,
      consistency: r.consistency || 0,
    }));
}

export function getPersonalRecords(
  results: MonkeyTypeResult[]
): PersonalRecord[] {
  const chrono = [...results].sort((a, b) => a.timestamp - b.timestamp);
  const records: PersonalRecord[] = [];
  let currentPB = 0;

  chrono.forEach((r, i) => {
    if (r.wpm > currentPB) {
      const improvement = currentPB === 0 ? 0 : r.wpm - currentPB;
      records.push({
        timestamp: r.timestamp,
        wpm: round2(r.wpm),
        date: new Date(r.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        improvement: round2(improvement),
        testIndex: i + 1,
      });
      currentPB = r.wpm;
    }
  });

  return records;
}

// NEW: Streak calendar — one cell per day over the last year
export function getStreakDays(results: MonkeyTypeResult[]): StreakDay[] {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 52 weeks * 7 days = 364 days; include today for 365
  const days: StreakDay[] = [];
  const byDate: Record<string, { count: number; wpmSum: number }> = {};

  for (const r of results) {
    const d = new Date(r.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    if (!byDate[key]) byDate[key] = { count: 0, wpmSum: 0 };
    byDate[key].count += 1;
    byDate[key].wpmSum += r.wpm;
  }

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today.getTime() - i * MS_PER_DAY);
    const key = d.toISOString().split("T")[0];
    const bucket = byDate[key] || { count: 0, wpmSum: 0 };
    days.push({
      date: key,
      timestamp: d.getTime(),
      test_count: bucket.count,
      avg_wpm: bucket.count > 0 ? round2(bucket.wpmSum / bucket.count) : 0,
    });
  }

  return days;
}

// NEW: Raw WPM vs clean WPM (shows the cost of errors)
export function getRawClean(results: MonkeyTypeResult[]): RawCleanPoint[] {
  return [...results]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      timestamp: r.timestamp,
      date: new Date(r.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      wpm: round2(r.wpm),
      rawWpm: round2(r.rawWpm || r.wpm),
      gap: round2(Math.max(0, (r.rawWpm || r.wpm) - r.wpm)),
    }));
}

export function processResults(
  results: MonkeyTypeResult[],
  goalWpm: number
): DashboardData {
  return {
    kpis: calculateKPIs(results, goalWpm),
    dailyStats: getDailyStats(results),
    chartData: getChartData(results),
    rawResults: results,
    personalRecords: getPersonalRecords(results),
    streakDays: getStreakDays(results),
    rawClean: getRawClean(results),
  };
}

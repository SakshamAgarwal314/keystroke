export interface MonkeyTypeResult {
  wpm: number;
  acc: number;
  consistency: number;
  rawWpm: number;
  mode: string;
  mode2: string;
  timestamp: number;
  language: string;
  charStats?: number[];
}

export interface KPIs {
  // Core Speed
  average_wpm: number;
  median_wpm: number;
  std_deviation: number;
  top_10_percent_avg: number;
  bottom_10_percent_avg: number;
  personal_best: number;

  // Accuracy & Consistency
  average_accuracy: number;
  average_consistency: number;

  // Rolling Averages
  rolling_7_day_avg: number;
  rolling_30_day_avg: number;

  // Volume
  total_tests: number;
  tests_this_week: number;
  tests_this_month: number;

  // Goal Tracking
  goal_wpm: number;
  distance_to_goal: number;
  tests_above_goal: number;
  tests_near_goal: number;
  percent_near_goal: number;

  // Improvement
  improvement_rate_per_30_days: number;
  estimated_days_to_goal: number | null;
  projected_goal_date: string | null;
}

export interface DailyStat {
  date: string;
  avg_wpm: number;
  max_wpm: number;
  min_wpm: number;
  avg_acc: number;
  avg_consistency: number;
  test_count: number;
}

export interface ChartDataPoint {
  date: string;
  timestamp: number;
  wpm: number;
  acc: number;
  consistency: number;
}

// One entry per personal best achieved
export interface PersonalRecord {
  timestamp: number;
  wpm: number;
  date: string;
  improvement: number;
  testIndex: number;
}

// NEW: One cell per day for streak calendar
export interface StreakDay {
  date: string; // YYYY-MM-DD
  timestamp: number; // day-start ms
  test_count: number;
  avg_wpm: number;
}

// NEW: Per-test point for raw vs clean WPM comparison
export interface RawCleanPoint {
  timestamp: number;
  date: string;
  wpm: number; // clean / scored WPM
  rawWpm: number; // raw WPM before penalty
  gap: number; // rawWpm - wpm, i.e. cost of errors
}

export interface DashboardData {
  kpis: KPIs;
  dailyStats: DailyStat[];
  chartData: ChartDataPoint[];
  rawResults: MonkeyTypeResult[];
  personalRecords: PersonalRecord[];
  streakDays: StreakDay[];
  rawClean: RawCleanPoint[];
}

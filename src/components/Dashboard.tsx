"use client";

import { useState, useMemo } from "react";
import { DashboardData } from "@/lib/types";
import { useTypewriter } from "@/lib/useTypewriter";
import { TimeWindow, filterByWindow } from "@/lib/timeWindow";
import KPICard from "./KPICard";
import WPMChart from "./WPMChart";
import AccuracyChart from "./AccuracyChart";
import ConsistencyChart from "./ConsistencyChart";
import GoalProgress from "./GoalProgress";
import StreakCalendar from "./StreakCalendar";
import PRTimeline from "./PRTimeline";
import RawVsCleanChart from "./RawVsCleanChart";
import GoalTab from "./GoalTab";
import TimeWindowPicker from "./TimeWindowPicker";

type Tab = "overview" | "insights" | "goal";

interface DashboardProps {
  data: DashboardData;
  onReset: () => void;
  onGoalChange: (goal: number) => void;
  notice?: string | null;
  isDemo?: boolean;
}

export default function Dashboard({
  data,
  onReset,
  onGoalChange,
  notice,
  isDemo,
}: DashboardProps) {
  const { kpis } = data;
  const [tab, setTab] = useState<Tab>("overview");

  const trend7vs30 =
    Math.round((kpis.rolling_7_day_avg - kpis.rolling_30_day_avg) * 10) / 10;
  const trendDirection =
    trend7vs30 > 0.5 ? "up" : trend7vs30 < -0.5 ? "down" : "flat";

  const typedAvg = useTypewriter(String(kpis.average_wpm), 55);

  return (
    <div className="min-h-screen bg-surface-0 text-ink relative">
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#e2b714 1px, transparent 1px), linear-gradient(90deg, #e2b714 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-ink-faint bg-surface-0/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <h1 className="text-lg font-display font-bold tracking-tight">
              keystroke<span className="text-accent">.</span>
            </h1>

            <nav className="flex items-center gap-1">
              {(["overview", "insights", "goal"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative text-xs font-mono uppercase tracking-[0.12em] px-3 py-1.5 rounded-md transition-colors ${
                    tab === t ? "text-accent" : "text-ink-dim hover:text-ink"
                  }`}
                >
                  {t}
                  {tab === t && (
                    <span className="absolute inset-x-2 -bottom-[13px] h-[2px] bg-accent" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-[0.15em] text-ink-dim px-2 py-0.5 rounded-full border border-ink-faint">
              {kpis.total_tests} tests
            </span>
            {isDemo && (
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent px-2 py-0.5 rounded-full border border-accent/40 bg-accent/5">
                demo
              </span>
            )}
            <button
              onClick={onReset}
              className="text-xs font-mono text-ink-dim hover:text-accent transition-colors"
            >
              ← switch account
            </button>
          </div>
        </div>
      </header>

      {notice && (
        <div className="border-b border-accent/20 bg-accent/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
            <span className="text-accent text-xs">◉</span>
            <p className="text-xs font-mono text-ink-dim">{notice}</p>
          </div>
        </div>
      )}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {tab === "overview" && (
          <OverviewTab
            data={data}
            typedAvg={typedAvg}
            trend7vs30={trend7vs30}
            trendDirection={trendDirection}
          />
        )}
        {tab === "insights" && <InsightsTab data={data} />}
        {tab === "goal" && <GoalTab data={data} onGoalChange={onGoalChange} />}
      </main>

      <footer className="border-t border-ink-faint mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] font-mono text-ink-dim/50">
            keystroke<span className="text-accent">.</span> — monkeytype analytics
          </p>
          <p className="text-[10px] font-mono text-ink-dim/50">
            saksham agarwal / 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Overview Tab ---------- */
function OverviewTab({
  data,
  typedAvg,
  trend7vs30,
  trendDirection,
}: {
  data: DashboardData;
  typedAvg: string;
  trend7vs30: number;
  trendDirection: "up" | "down" | "flat";
}) {
  const { kpis, dailyStats, chartData } = data;

  const [window, setWindow] = useState<TimeWindow>("90d");

  // Filter chart + dailyStats by the selected window
  const windowedCharts = useMemo(() => {
    const filteredChart = filterByWindow(chartData, window);
    // dailyStats has `date` (YYYY-MM-DD) — convert to timestamp for the helper
    const dailyWithTs = dailyStats.map((d) => ({
      ...d,
      timestamp: new Date(d.date).getTime(),
    }));
    const filteredDaily = filterByWindow(dailyWithTs, window);
    return { filteredChart, filteredDaily };
  }, [chartData, dailyStats, window]);

  return (
    <>
      {/* HERO */}
      <section
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-2"
        style={{ opacity: 0, animation: "fade-up 0.5s ease-out forwards" }}
      >
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-ink-dim mb-3">
            ◢ your average
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-7xl sm:text-8xl font-display font-bold text-accent tracking-tighter leading-none tabular-nums">
              {typedAvg}
              {typedAvg.length < String(kpis.average_wpm).length && (
                <span className="inline-block w-[0.08em] h-[0.7em] bg-accent ml-1 align-baseline animate-pulse" />
              )}
            </span>
            <span className="text-2xl font-mono text-ink-dim">WPM</span>
          </div>
          <p className="text-sm font-mono text-ink-dim mt-3">
            across {kpis.total_tests} tests · best:{" "}
            <span className="text-speed-peak">{kpis.personal_best}</span> · goal:{" "}
            <span className="text-ink">{kpis.goal_wpm}</span>
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-3 px-5 py-4 rounded-xl border ${
            trendDirection === "up"
              ? "border-speed-high/40 bg-speed-high/5"
              : trendDirection === "down"
              ? "border-speed-low/40 bg-speed-low/5"
              : "border-ink-faint bg-surface-1"
          }`}
        >
          <span
            className={`text-3xl ${
              trendDirection === "up"
                ? "text-speed-high"
                : trendDirection === "down"
                ? "text-speed-low"
                : "text-ink-dim"
            }`}
          >
            {trendDirection === "up" ? "↗" : trendDirection === "down" ? "↘" : "→"}
          </span>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-dim">
              7d vs 30d
            </p>
            <p
              className={`text-lg font-display font-semibold ${
                trendDirection === "up"
                  ? "text-speed-high"
                  : trendDirection === "down"
                  ? "text-speed-low"
                  : "text-ink"
              }`}
            >
              {trend7vs30 > 0 ? "+" : ""}
              {trend7vs30} WPM
            </p>
          </div>
        </div>
      </section>

      {/* Core stats */}
      <section>
        <SectionHeader tag="01" title="core stats" subtitle="speed, accuracy, consistency" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <KPICard label="Median" value={`${kpis.median_wpm}`} subtitle="WPM" delay={0} />
          <KPICard
            label="7-Day Avg"
            value={`${kpis.rolling_7_day_avg}`}
            subtitle="WPM"
            trend={
              kpis.rolling_7_day_avg > kpis.rolling_30_day_avg
                ? "up"
                : kpis.rolling_7_day_avg < kpis.rolling_30_day_avg
                ? "down"
                : "neutral"
            }
            trendValue={`${Math.abs(trend7vs30)} vs 30d`}
            delay={50}
          />
          <KPICard label="30-Day Avg" value={`${kpis.rolling_30_day_avg}`} subtitle="WPM" delay={100} />
          <KPICard
            label="Accuracy"
            value={`${kpis.average_accuracy}%`}
            trend={kpis.average_accuracy >= 97 ? "up" : "down"}
            trendValue={kpis.average_accuracy >= 97 ? "on target" : "below 97%"}
            delay={150}
          />
          <KPICard label="Consistency" value={`${kpis.average_consistency}%`} delay={200} />
          <KPICard label="Std Dev" value={`±${kpis.std_deviation}`} subtitle="spread" delay={250} />
        </div>
      </section>

      {/* Time window picker + charts */}
      <section>
        <SectionHeader tag="02" title="trends" subtitle="scoped to the window you pick below" />
        <div className="mt-4 mb-4">
          <TimeWindowPicker
            value={window}
            onChange={setWindow}
            availableCount={windowedCharts.filteredChart.length}
          />
        </div>

        <div className="space-y-4">
          <WPMChart
            data={windowedCharts.filteredChart}
            goalWpm={kpis.goal_wpm}
            averageWpm={kpis.average_wpm}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <AccuracyChart data={windowedCharts.filteredDaily} />
            <ConsistencyChart data={windowedCharts.filteredDaily} />
          </div>
        </div>
      </section>

      {/* Volume */}
      <section>
        <SectionHeader tag="03" title="volume" subtitle="ceiling, floor, activity" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <KPICard label="Top 10% Avg" value={`${kpis.top_10_percent_avg}`} subtitle="your ceiling" delay={0} />
          <KPICard label="Bottom 10% Avg" value={`${kpis.bottom_10_percent_avg}`} subtitle="your floor" delay={50} />
          <KPICard label="This Week" value={`${kpis.tests_this_week}`} subtitle="tests" delay={100} />
          <KPICard label="This Month" value={`${kpis.tests_this_month}`} subtitle="tests" delay={150} />
        </div>
      </section>
    </>
  );
}

/* ---------- Insights Tab ---------- */
function InsightsTab({ data }: { data: DashboardData }) {
  return (
    <>
      <section
        className="pt-2"
        style={{ opacity: 0, animation: "fade-up 0.5s ease-out forwards" }}
      >
        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-ink-dim mb-3">
          ◢ insights
        </p>
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-ink tracking-tight leading-none">
          the patterns <span className="text-accent">behind</span> your numbers.
        </h2>
        <p className="text-sm font-mono text-ink-dim mt-3 max-w-xl">
          three views your eyes can&apos;t catch from the main charts alone —
          how often you show up, how far you&apos;ve climbed, what errors cost
          you.
        </p>
      </section>

      <section>
        <SectionHeader tag="04" title="streak" subtitle="last 12 months of practice" />
        <div className="mt-4">
          <StreakCalendar data={data.streakDays} />
        </div>
      </section>

      <section>
        <SectionHeader tag="05" title="milestones" subtitle="every personal best you've hit" />
        <div className="mt-4">
          <PRTimeline data={data.personalRecords} />
        </div>
      </section>

      <section>
        <SectionHeader tag="06" title="error cost" subtitle="raw wpm vs clean wpm — what mistakes are worth" />
        <div className="mt-4">
          <RawVsCleanChart data={data.rawClean} />
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-baseline gap-4 border-b border-ink-faint pb-2">
      <span className="text-[10px] font-mono text-accent tracking-[0.3em]">
        / {tag}
      </span>
      <h2 className="text-xl font-display font-bold text-ink lowercase tracking-tight">
        {title}
      </h2>
      <span className="text-xs font-mono text-ink-dim/60 hidden sm:inline">
        — {subtitle}
      </span>
    </div>
  );
}

"use client";

import { KPIs } from "@/lib/types";

interface GoalProgressProps {
  kpis: KPIs;
}

export default function GoalProgress({ kpis }: GoalProgressProps) {
  const progress = Math.min(100, (kpis.average_wpm / kpis.goal_wpm) * 100);
  const nearGoalThreshold = kpis.goal_wpm - 10;
  const isGoalReached = kpis.distance_to_goal <= 0;

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5 h-full flex flex-col"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out 600ms forwards" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            goal progress
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            {isGoalReached ? "goal reached — push higher" : "closing the gap"}
          </p>
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${
            isGoalReached
              ? "bg-speed-high/10 text-speed-high border border-speed-high/30"
              : "bg-accent/10 text-accent border border-accent/30"
          }`}
        >
          {Math.round(progress)}%
        </span>
      </div>

      {/* Main progress bar */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-3xl font-display font-bold text-ink tracking-tight">
            {kpis.average_wpm}
          </span>
          <span className="text-sm font-mono text-ink-dim">
            / {kpis.goal_wpm} wpm
          </span>
        </div>
        <div className="relative h-3 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              background:
                progress >= 100
                  ? "linear-gradient(90deg, #7bc96f, #4af5a1)"
                  : progress >= 90
                  ? "linear-gradient(90deg, #e2b714, #7bc96f)"
                  : "linear-gradient(90deg, #e2b714, #f5d54a)",
            }}
          />
          {/* Glow effect */}
          <div
            className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-60"
            style={{
              width: `${progress}%`,
              background: progress >= 100 ? "#4af5a1" : "#e2b714",
            }}
          />
        </div>
        <p className="text-[11px] font-mono text-ink-dim mt-2">
          {kpis.distance_to_goal > 0
            ? `${kpis.distance_to_goal} wpm to go`
            : "goal reached ✓"}
          {kpis.estimated_days_to_goal &&
            ` · ~${kpis.estimated_days_to_goal}d at current pace`}
        </p>
      </div>

      {/* Breakdown stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-surface-2 p-3 text-center border border-ink-faint/50">
          <p className="text-xl font-display font-bold text-speed-peak leading-none">
            {kpis.personal_best}
          </p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-ink-dim mt-1.5">
            best
          </p>
        </div>
        <div className="rounded-lg bg-surface-2 p-3 text-center border border-ink-faint/50">
          <p className="text-xl font-display font-bold text-speed-high leading-none">
            {kpis.tests_above_goal}
          </p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-ink-dim mt-1.5">
            ≥ goal
          </p>
        </div>
        <div className="rounded-lg bg-surface-2 p-3 text-center border border-ink-faint/50">
          <p className="text-xl font-display font-bold text-accent leading-none">
            {kpis.percent_near_goal}%
          </p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-ink-dim mt-1.5">
            ≥ {nearGoalThreshold}
          </p>
        </div>
      </div>

      {/* Improvement rate */}
      <div className="mt-auto pt-3 border-t border-ink-faint">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-ink-dim uppercase tracking-wider">
            30-day trend
          </span>
          <span
            className={`text-sm font-mono font-semibold ${
              kpis.improvement_rate_per_30_days > 0
                ? "text-speed-high"
                : kpis.improvement_rate_per_30_days < 0
                ? "text-speed-low"
                : "text-ink-dim"
            }`}
          >
            {kpis.improvement_rate_per_30_days > 0 ? "↑ +" : kpis.improvement_rate_per_30_days < 0 ? "↓ " : ""}
            {kpis.improvement_rate_per_30_days} wpm
          </span>
        </div>
      </div>
    </div>
  );
}

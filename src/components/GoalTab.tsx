"use client";

import { DashboardData } from "@/lib/types";
import GoalProgress from "./GoalProgress";
import { useTypewriter } from "@/lib/useTypewriter";
import { useEffect, useState } from "react";

interface GoalTabProps {
  data: DashboardData;
  onGoalChange: (goal: number) => void;
}

const JFK_QUOTE =
  "We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.";
const JFK_ATTRIBUTION = "— John F. Kennedy, Rice University, 1962";

export default function GoalTab({ data, onGoalChange }: GoalTabProps) {
  const { kpis } = data;
  const [localGoal, setLocalGoal] = useState(kpis.goal_wpm);

  useEffect(() => {
    setLocalGoal(kpis.goal_wpm);
  }, [kpis.goal_wpm]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localGoal !== kpis.goal_wpm) onGoalChange(localGoal);
    }, 120);
    return () => clearTimeout(t);
  }, [localGoal, kpis.goal_wpm, onGoalChange]);

  const projectedDate = kpis.projected_goal_date
    ? new Date(kpis.projected_goal_date)
    : null;

  const prettyDate = projectedDate
    ? projectedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isGoalReached = kpis.distance_to_goal <= 0;
  const hasTrajectory =
    kpis.improvement_rate_per_30_days > 0 && !isGoalReached;

  // Fixed: use the shared useTypewriter hook (handles Strict Mode correctly)
  const typedQuote = useTypewriter(JFK_QUOTE, 28);

  return (
    <>
      <section
        className="pt-2"
        style={{ opacity: 0, animation: "fade-up 0.5s ease-out forwards" }}
      >
        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-ink-dim mb-3">
          ◢ your goal
        </p>
        <h2 className="text-4xl sm:text-5xl font-display font-bold text-ink tracking-tight leading-none">
          aim somewhere <span className="text-accent">specific</span>.
        </h2>
        <p className="text-sm font-mono text-ink-dim mt-3 max-w-xl">
          pick a target wpm — the whole dashboard updates around it, including
          the projected date you&apos;ll hit it at your current pace.
        </p>
      </section>

      <section
        className="grid md:grid-cols-5 gap-6"
        style={{ opacity: 0, animation: "fade-up 0.5s ease-out 100ms forwards" }}
      >
        <div className="md:col-span-3 rounded-2xl border border-ink-faint bg-surface-1 p-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink-dim mb-3">
            projected
          </p>
          {isGoalReached ? (
            <>
              <p className="text-5xl sm:text-6xl font-display font-bold text-speed-peak tracking-tight leading-none">
                goal reached.
              </p>
              <p className="text-sm font-mono text-ink-dim mt-4">
                your average ({kpis.average_wpm}) is above {kpis.goal_wpm} WPM.
                try setting a harder target.
              </p>
            </>
          ) : hasTrajectory ? (
            <>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink tracking-tight leading-[1.05]">
                you&apos;ll hit{" "}
                <span className="text-accent">{kpis.goal_wpm}</span> wpm
              </p>
              <p className="text-2xl sm:text-3xl font-display font-bold text-ink-dim tracking-tight leading-tight mt-2">
                around{" "}
                <span className="text-accent">
                  {prettyDate}
                  <span className="text-accent/60 text-xl align-super">*</span>
                </span>
              </p>
              <p className="text-sm font-mono text-ink-dim mt-4">
                ≈ {kpis.estimated_days_to_goal} days away · based on your last
                30-day improvement rate of{" "}
                <span className="text-speed-high">
                  +{kpis.improvement_rate_per_30_days}
                </span>{" "}
                WPM
              </p>
              <p className="text-[11px] font-mono text-ink-dim/60 mt-3 italic leading-relaxed max-w-lg">
                <span className="text-accent/60">*</span> only if you keep
                practicing at your current pace. improvement naturally slows as
                you approach your ceiling — expect plateaus.
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl sm:text-5xl font-display font-bold text-ink-dim tracking-tight leading-none">
                no projection yet.
              </p>
              <p className="text-sm font-mono text-ink-dim mt-4">
                {kpis.improvement_rate_per_30_days <= 0
                  ? "your 30-day trend is flat or declining — try practicing more consistently to see a projected date."
                  : "not enough recent data for a reliable projection. keep grinding."}
              </p>
            </>
          )}
        </div>

        <div className="md:col-span-2">
          <GoalProgress kpis={kpis} />
        </div>
      </section>

      <section
        className="rounded-2xl border border-ink-faint bg-surface-1 p-6"
        style={{ opacity: 0, animation: "fade-up 0.5s ease-out 200ms forwards" }}
      >
        <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink-dim">
              set your target
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-display font-bold text-accent tracking-tight tabular-nums">
                {localGoal}
              </span>
              <span className="text-lg font-mono text-ink-dim">WPM</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-dim">
              currently at
            </p>
            <p className="text-2xl font-display font-bold text-ink tabular-nums">
              {kpis.average_wpm}
            </p>
          </div>
        </div>

        <div className="relative pt-4">
          <div className="absolute inset-x-0 -top-1 flex justify-between text-[9px] font-mono text-ink-dim/50 px-1">
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>250</span>
            <span>300</span>
          </div>
          <input
            type="range"
            min={50}
            max={300}
            step={1}
            value={localGoal}
            onChange={(e) => setLocalGoal(Number(e.target.value))}
            className="w-full goal-slider"
          />
          <div
            className="absolute top-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{
              left: `${((kpis.average_wpm - 50) / 250) * 100}%`,
            }}
          >
            <div className="w-[2px] h-3 bg-ink-dim/60" />
            <span className="text-[9px] font-mono text-ink-dim/70 mt-0.5 whitespace-nowrap">
              avg
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-12">
          {[100, 120, 140, 160, 180].map((preset) => (
            <button
              key={preset}
              onClick={() => setLocalGoal(preset)}
              className={`py-2 rounded-lg font-mono text-sm border transition-all ${
                localGoal === preset
                  ? "bg-accent text-surface-0 border-accent"
                  : "text-ink-dim border-ink-faint hover:border-accent/40 hover:text-accent"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </section>

      <section
        className="pt-8 pb-4"
        style={{ opacity: 0, animation: "fade-up 0.5s ease-out 400ms forwards" }}
      >
        <div className="relative rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 sm:p-10">
          <span className="absolute top-4 left-6 text-5xl text-accent/30 font-display leading-none select-none">
            &ldquo;
          </span>
          <blockquote className="pl-8">
            <p className="text-lg sm:text-xl font-mono text-ink leading-relaxed italic min-h-[6rem]">
              {typedQuote}
              {typedQuote.length < JFK_QUOTE.length && (
                <span className="inline-block w-[0.5ch] h-[1em] bg-accent ml-0.5 align-middle animate-pulse" />
              )}
            </p>
            <footer className="text-[11px] font-mono text-ink-dim mt-4 tracking-wide">
              {JFK_ATTRIBUTION}
            </footer>
          </blockquote>
        </div>
      </section>
    </>
  );
}

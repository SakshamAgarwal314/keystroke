"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RawCleanPoint } from "@/lib/types";
import { useMemo } from "react";

interface RawVsCleanChartProps {
  data: RawCleanPoint[];
}

function movingAverage(data: number[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export default function RawVsCleanChart({ data }: RawVsCleanChartProps) {
  const chartData = useMemo(() => {
    // Smooth with a 15-test moving average — individual tests are too noisy
    const raw = data.map((d) => d.rawWpm);
    const clean = data.map((d) => d.wpm);
    const rawMA = movingAverage(raw, 15);
    const cleanMA = movingAverage(clean, 15);
    return data.map((d, i) => ({
      ...d,
      rawMA: rawMA[i] !== null ? Math.round(rawMA[i]! * 10) / 10 : null,
      cleanMA: cleanMA[i] !== null ? Math.round(cleanMA[i]! * 10) / 10 : null,
    }));
  }, [data]);

  const summary = useMemo(() => {
    if (data.length === 0) {
      return { avgGap: 0, pctCost: 0, recentGap: 0, trend: "flat" as const };
    }
    const allGaps = data.map((d) => d.gap);
    const avgGap = allGaps.reduce((a, b) => a + b, 0) / allGaps.length;

    const avgRaw = data.reduce((s, d) => s + d.rawWpm, 0) / data.length;
    const pctCost = avgRaw > 0 ? (avgGap / avgRaw) * 100 : 0;

    // Compare recent vs older to show if errors are costing more or less
    const recent = data.slice(-Math.min(50, Math.floor(data.length / 4)));
    const older = data.slice(0, Math.min(50, Math.floor(data.length / 4)));
    const recentGap =
      recent.reduce((s, d) => s + d.gap, 0) / Math.max(recent.length, 1);
    const olderGap =
      older.reduce((s, d) => s + d.gap, 0) / Math.max(older.length, 1);

    const delta = recentGap - olderGap;
    let trend: "up" | "down" | "flat" = "flat";
    if (delta < -1) trend = "down"; // gap shrinking = improving
    else if (delta > 1) trend = "up"; // gap growing = worsening

    return {
      avgGap: Math.round(avgGap * 10) / 10,
      pctCost: Math.round(pctCost * 10) / 10,
      recentGap: Math.round(recentGap * 10) / 10,
      trend,
    };
  }, [data]);

  if (chartData.length < 2) {
    return (
      <div className="rounded-xl border border-ink-faint bg-surface-1 p-5">
        <h3 className="text-sm font-display font-semibold text-ink">
          error cost
        </h3>
        <p className="text-xs font-mono text-ink-dim mt-8 text-center py-8">
          need more tests to compute error cost trends
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out 200ms forwards" }}
    >
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            error cost · raw vs clean wpm
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            the gap is what errors cost you · smoothed over 15 tests
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-dim">
              avg gap
            </p>
            <p className="text-lg font-display font-bold text-speed-low">
              −{summary.avgGap}
            </p>
            <p className="text-[10px] font-mono text-ink-dim">
              {summary.pctCost}% of raw
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-dim">
              trend
            </p>
            <p
              className={`text-lg font-display font-bold ${
                summary.trend === "down"
                  ? "text-speed-high"
                  : summary.trend === "up"
                  ? "text-speed-low"
                  : "text-ink"
              }`}
            >
              {summary.trend === "down"
                ? "↓ improving"
                : summary.trend === "up"
                ? "↑ worsening"
                : "→ steady"}
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
        >
          <defs>
            <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ca4754" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#ca4754" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2c2e31" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{
              fill: "#646669",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={{ stroke: "#2c2e31" }}
            interval={Math.max(0, Math.floor(chartData.length / 8))}
          />
          <YAxis
            tick={{
              fill: "#646669",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a26",
              border: "1px solid #2c2e31",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
              color: "#d1d0c5",
            }}
            formatter={(value: any, name: string) => {
              if (value === null || value === undefined) return ["—", name];
              const labels: Record<string, string> = {
                rawMA: "raw wpm",
                cleanMA: "clean wpm",
              };
              return [Math.round(value * 10) / 10, labels[name] || name];
            }}
            cursor={{ stroke: "#e2b714", strokeOpacity: 0.3, strokeWidth: 1 }}
          />
          {/* Fill the gap between raw and clean */}
          <Area
            dataKey="rawMA"
            stroke="transparent"
            fill="url(#gapGradient)"
            isAnimationActive={true}
            animationDuration={1200}
            connectNulls
          />
          <Line
            dataKey="rawMA"
            stroke="#646669"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
            connectNulls
          />
          <Line
            dataKey="cleanMA"
            stroke="#e2b714"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={1500}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-end gap-4 mt-2 text-[10px] font-mono uppercase tracking-wider text-ink-dim">
        <span className="flex items-center gap-1.5">
          <span
            className="w-4 h-[2px] bg-ink-dim"
            style={{ borderBottom: "1px dashed" }}
          />{" "}
          raw wpm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[2px] bg-accent" /> clean wpm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-speed-low/30" /> error cost
        </span>
      </div>
    </div>
  );
}

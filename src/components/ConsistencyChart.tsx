"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DailyStat } from "@/lib/types";

interface ConsistencyChartProps {
  data: DailyStat[];
}

export default function ConsistencyChart({ data }: ConsistencyChartProps) {
  const chartData = data
    .filter((d) => d.avg_consistency > 0)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      consistency: d.avg_consistency,
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-ink-faint bg-surface-1 p-5">
        <h3 className="text-sm font-display font-semibold text-ink">
          consistency
        </h3>
        <p className="text-xs font-mono text-ink-dim text-center py-8">
          no consistency data in this window
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out 350ms forwards" }}
    >
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            consistency
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            how steady your pace is, day by day
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
        >
          <defs>
            <linearGradient id="consGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9b59b6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#9b59b6" stopOpacity={0.02} />
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
            interval={Math.max(0, Math.floor(chartData.length / 6))}
          />
          <YAxis
            tick={{
              fill: "#646669",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            domain={[50, 100]}
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
            formatter={(value: number) => [
              `${Math.round(value * 10) / 10}%`,
              "consistency",
            ]}
            cursor={{ stroke: "#e2b714", strokeOpacity: 0.3, strokeWidth: 1 }}
          />
          <Area
            dataKey="consistency"
            stroke="#9b59b6"
            strokeWidth={2}
            fill="url(#consGradient)"
            isAnimationActive={true}
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

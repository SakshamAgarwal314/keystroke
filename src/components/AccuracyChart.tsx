"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { DailyStat } from "@/lib/types";

interface AccuracyChartProps {
  data: DailyStat[];
}

export default function AccuracyChart({ data }: AccuracyChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    accuracy: d.avg_acc,
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-ink-faint bg-surface-1 p-5">
        <h3 className="text-sm font-display font-semibold text-ink">accuracy</h3>
        <p className="text-xs font-mono text-ink-dim text-center py-8">
          no data in this window
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out 250ms forwards" }}
    >
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            accuracy
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            daily avg · 97% target
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
        >
          <defs>
            <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0.02} />
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
            domain={[85, 100]}
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
              "accuracy",
            ]}
            cursor={{ stroke: "#e2b714", strokeOpacity: 0.3, strokeWidth: 1 }}
          />
          <ReferenceLine
            y={97}
            stroke="#ca4754"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            strokeOpacity={0.6}
            label={{
              value: "97%",
              position: "right",
              fill: "#ca4754",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
          />
          <Area
            dataKey="accuracy"
            stroke="#5B8DEF"
            strokeWidth={2}
            fill="url(#accGradient)"
            isAnimationActive={true}
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

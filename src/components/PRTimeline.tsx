"use client";

import {
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import { PersonalRecord } from "@/lib/types";
import { useMemo } from "react";

interface PRTimelineProps {
  data: PersonalRecord[];
}

export default function PRTimeline({ data }: PRTimelineProps) {
  const chartData = useMemo(() => {
    return data.map((pr, i) => ({
      ...pr,
      index: i,
      dateLabel: new Date(pr.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [data]);

  const latest = chartData[chartData.length - 1];
  const totalImprovement =
    chartData.length > 1
      ? Math.round((chartData[chartData.length - 1].wpm - chartData[0].wpm) * 10) /
        10
      : 0;

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-ink-faint bg-surface-1 p-5">
        <h3 className="text-sm font-display font-semibold text-ink">
          personal records
        </h3>
        <p className="text-xs font-mono text-ink-dim mt-8 text-center py-8">
          no PBs yet — take a test to start tracking
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out 150ms forwards" }}
    >
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            personal records
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            every time you broke your own PB · {chartData.length} PBs total
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-dim">
            current PB
          </p>
          <p className="text-xl font-display font-bold text-speed-peak">
            {latest.wpm}
          </p>
          <p className="text-[11px] font-mono text-speed-high">
            +{totalImprovement} since start
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={chartData}
          margin={{ top: 15, right: 20, bottom: 0, left: -10 }}
        >
          <CartesianGrid stroke="#2c2e31" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="dateLabel"
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
            formatter={(value: number, name: string, item: any) => {
              if (name === "wpm") {
                const pr = item.payload as PersonalRecord & { dateLabel: string };
                return [
                  `${value} wpm`,
                  pr.improvement > 0
                    ? `PB · +${pr.improvement}`
                    : "first record",
                ];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `${label}`}
            cursor={{ stroke: "#e2b714", strokeOpacity: 0.3 }}
          />
          {/* Step-line connecting PRs to show the "staircase" upward */}
          <Line
            type="stepAfter"
            dataKey="wpm"
            stroke="#e2b714"
            strokeWidth={2}
            strokeOpacity={0.35}
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
          />
          <Scatter
            dataKey="wpm"
            isAnimationActive={true}
            animationDuration={1200}
            shape={(props: any) => {
              const { cx, cy, payload } = props;
              const isLatest = payload.index === chartData.length - 1;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? 6 : 4}
                  fill={isLatest ? "#4af5a1" : "#7bc96f"}
                  stroke={isLatest ? "#4af5a1" : "none"}
                  strokeWidth={isLatest ? 3 : 0}
                  strokeOpacity={isLatest ? 0.35 : 0}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { ChartDataPoint } from "@/lib/types";
import { useMemo } from "react";

interface WPMChartProps {
  data: ChartDataPoint[];
  goalWpm: number;
  averageWpm: number;
}

function movingAverage(data: number[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export default function WPMChart({ data, goalWpm, averageWpm }: WPMChartProps) {
  const chartData = useMemo(() => {
    const wpms = data.map((d) => d.wpm);
    const ma7 = movingAverage(wpms, 7);
    const ma30 = movingAverage(wpms, 30);

    return data.map((d, i) => ({
      ...d,
      ma7: ma7[i] !== null ? Math.round(ma7[i]! * 10) / 10 : undefined,
      ma30: ma30[i] !== null ? Math.round(ma30[i]! * 10) / 10 : undefined,
      index: i,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-ink-faint bg-surface-1 p-8 text-center">
        <p className="text-sm font-mono text-ink-dim">
          No data to chart yet. Take some tests on monkeytype.com.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5 h-full"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out 300ms forwards" }}
    >
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            WPM progress
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            each dot = one test · lines = rolling averages
          </p>
        </div>
        <div className="flex gap-3 text-[10px] font-mono uppercase tracking-wider text-ink-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ink-dim/60" /> tests
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-speed-high" /> 7-test
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" /> 30-test
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
        >
          <CartesianGrid
            stroke="#2c2e31"
            strokeDasharray="3 3"
            vertical={false}
          />
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
            domain={["dataMin - 15", "dataMax + 10"]}
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
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                wpm: "WPM",
                ma7: "7-test avg",
                ma30: "30-test avg",
              };
              return [Math.round(value * 10) / 10, labels[name] || name];
            }}
            cursor={{ stroke: "#e2b714", strokeOpacity: 0.3, strokeWidth: 1 }}
          />
          <ReferenceLine
            y={goalWpm}
            stroke="#e2b714"
            strokeDasharray="8 4"
            strokeWidth={2}
            strokeOpacity={0.5}
            label={{
              value: `goal: ${goalWpm}`,
              position: "insideTopRight",
              fill: "#e2b714",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
              dy: -4,
            }}
          />
          <ReferenceLine
            y={averageWpm}
            stroke="#646669"
            strokeDasharray="4 4"
            strokeWidth={1}
            strokeOpacity={0.5}
            label={{
              value: `avg: ${Math.round(averageWpm)}`,
              position: "insideTopLeft",
              fill: "#646669",
              fontSize: 9,
              fontFamily: "JetBrains Mono",
              dy: -4,
            }}
          />
          <Scatter
            dataKey="wpm"
            fill="#646669"
            fillOpacity={0.4}
            r={2.5}
            isAnimationActive={false}
          />
          <Line
            dataKey="ma7"
            stroke="#7bc96f"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={1200}
          />
          <Line
            dataKey="ma30"
            stroke="#e2b714"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

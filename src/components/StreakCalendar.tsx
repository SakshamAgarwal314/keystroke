"use client";

import { StreakDay } from "@/lib/types";
import { useMemo } from "react";

interface StreakCalendarProps {
  data: StreakDay[];
}

const DAY_LABELS = ["Mon", "Wed", "Fri"]; // show every other for less clutter
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function StreakCalendar({ data }: StreakCalendarProps) {
  // Group into columns (weeks). Each column is 7 cells (Sun..Sat).
  // We pad the first column with empty cells so the grid aligns with actual weekdays.
  const weeks = useMemo(() => {
    if (data.length === 0) return [];

    const firstDay = new Date(data[0].timestamp);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const cells: (StreakDay | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    cells.push(...data);

    const cols: (StreakDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      cols.push(cells.slice(i, i + 7));
    }
    return cols;
  }, [data]);

  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalTests: 0,
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        maxTests: 0,
      };
    }

    const totalTests = data.reduce((s, d) => s + d.test_count, 0);
    const activeDays = data.filter((d) => d.test_count > 0).length;
    const maxTests = Math.max(...data.map((d) => d.test_count));

    // Current streak: count back from today through consecutive active days
    let currentStreak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].test_count > 0) currentStreak++;
      else break;
    }

    // Longest streak: scan forward tracking runs
    let longestStreak = 0;
    let run = 0;
    for (const d of data) {
      if (d.test_count > 0) {
        run += 1;
        if (run > longestStreak) longestStreak = run;
      } else {
        run = 0;
      }
    }

    return { totalTests, activeDays, currentStreak, longestStreak, maxTests };
  }, [data]);

  // Intensity 0..1 for coloring a cell
  const intensity = (day: StreakDay): number => {
    if (day.test_count === 0) return 0;
    if (stats.maxTests <= 1) return 0.6;
    // Log scale so 1 test isn't invisible but heavy days still pop
    return Math.min(1, Math.log(day.test_count + 1) / Math.log(stats.maxTests + 1));
  };

  // Month label row — place label on first week whose first day is in that month
  const monthLabels = useMemo(() => {
    const labels: { colIndex: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((col, ci) => {
      const firstReal = col.find((c) => c !== null);
      if (!firstReal) return;
      const m = new Date(firstReal.timestamp).getMonth();
      if (m !== lastMonth) {
        labels.push({ colIndex: ci, label: MONTHS[m] });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div
      className="rounded-xl border border-ink-faint bg-surface-1 p-5"
      style={{ opacity: 0, animation: "fade-up 0.5s ease-out forwards" }}
    >
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-display font-semibold text-ink">
            practice streak
          </h3>
          <p className="text-[11px] font-mono text-ink-dim/70 mt-1">
            last 12 months · darker = more tests that day
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <StatTile label="current" value={`${stats.currentStreak}d`} accent />
          <StatTile label="longest" value={`${stats.longestStreak}d`} />
          <StatTile label="active days" value={`${stats.activeDays}`} />
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex items-center pl-9 mb-1 relative h-4">
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.colIndex}`}
                className="absolute text-[9px] font-mono uppercase tracking-wider text-ink-dim/70"
                style={{ left: `${36 + m.colIndex * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[2px]">
            {/* Weekday labels column */}
            <div className="flex flex-col gap-[2px] mr-1.5 w-7">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="h-[12px] text-[9px] font-mono uppercase tracking-wider text-ink-dim/60 flex items-center justify-end"
                >
                  {i === 1 ? "Mon" : i === 3 ? "Wed" : i === 5 ? "Fri" : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }, (_, ri) => {
                  const cell = col[ri];
                  if (!cell) {
                    return (
                      <div
                        key={ri}
                        className="w-[12px] h-[12px] rounded-[2px] bg-transparent"
                      />
                    );
                  }
                  const intens = intensity(cell);
                  const bg =
                    cell.test_count === 0
                      ? "#1a1a26"
                      : `rgba(226, 183, 20, ${0.15 + intens * 0.8})`;
                  const dateLabel = new Date(cell.timestamp).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  );
                  return (
                    <div
                      key={ri}
                      className="group relative w-[12px] h-[12px] rounded-[2px] transition-transform hover:scale-[1.4] hover:z-10 cursor-default"
                      style={{ backgroundColor: bg }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-surface-2 border border-ink-faint rounded-md px-2 py-1.5 text-[10px] font-mono z-20 shadow-lg">
                        {cell.test_count === 0 ? (
                          <span className="text-ink-dim">{dateLabel}</span>
                        ) : (
                          <>
                            <div className="text-ink">
                              {cell.test_count} test
                              {cell.test_count !== 1 ? "s" : ""}
                              {cell.avg_wpm > 0 && (
                                <span className="text-ink-dim">
                                  {" "}
                                  · {cell.avg_wpm} wpm avg
                                </span>
                              )}
                            </div>
                            <div className="text-ink-dim/70 text-[9px]">
                              {dateLabel}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-mono text-ink-dim">
        <span>less</span>
        <div className="flex gap-0.5">
          {[0, 0.2, 0.4, 0.6, 0.85].map((i, idx) => (
            <div
              key={idx}
              className="w-[11px] h-[11px] rounded-[2px]"
              style={{
                backgroundColor:
                  i === 0 ? "#1a1a26" : `rgba(226, 183, 20, ${0.15 + i * 0.8})`,
              }}
            />
          ))}
        </div>
        <span>more</span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-dim">
        {label}
      </p>
      <p
        className={`text-xl font-display font-bold ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

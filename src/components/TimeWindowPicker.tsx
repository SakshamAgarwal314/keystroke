"use client";

import { TimeWindow, TIME_WINDOW_OPTIONS } from "@/lib/timeWindow";

interface TimeWindowPickerProps {
  value: TimeWindow;
  onChange: (w: TimeWindow) => void;
  availableCount?: number; // how many tests currently in the window (for display)
}

export default function TimeWindowPicker({
  value,
  onChange,
  availableCount,
}: TimeWindowPickerProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-dim">
          window
        </span>
        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-ink-faint bg-surface-1">
          {TIME_WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                value === opt.value
                  ? "bg-accent text-surface-0"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {availableCount !== undefined && (
        <span className="text-[10px] font-mono text-ink-dim/70 uppercase tracking-wider">
          {availableCount} test{availableCount !== 1 ? "s" : ""} in range
        </span>
      )}
    </div>
  );
}

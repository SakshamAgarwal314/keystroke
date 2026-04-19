export type TimeWindow = "1w" | "30d" | "90d" | "6m" | "1y" | "all";

export const TIME_WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: "1w", label: "1w" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "6m", label: "6m" },
  { value: "1y", label: "1y" },
  { value: "all", label: "all" },
];

export function getWindowMs(w: TimeWindow): number | null {
  const DAY = 24 * 60 * 60 * 1000;
  switch (w) {
    case "1w":
      return 7 * DAY;
    case "30d":
      return 30 * DAY;
    case "90d":
      return 90 * DAY;
    case "6m":
      return 180 * DAY;
    case "1y":
      return 365 * DAY;
    case "all":
      return null;
  }
}

export function filterByWindow<T extends { timestamp: number }>(
  items: T[],
  window: TimeWindow
): T[] {
  const span = getWindowMs(window);
  if (span === null) return items;
  const cutoff = Date.now() - span;
  return items.filter((i) => i.timestamp >= cutoff);
}

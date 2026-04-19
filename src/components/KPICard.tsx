"use client";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: boolean;
  delay?: number;
}

export default function KPICard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  accent,
  delay = 0,
}: KPICardProps) {
  const trendColor =
    trend === "up"
      ? "text-speed-high"
      : trend === "down"
      ? "text-speed-low"
      : "text-ink-dim";
  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 ${
        accent
          ? "border-accent/30 bg-accent/[0.06]"
          : "border-ink-faint bg-surface-1"
      }`}
      style={{
        opacity: 0,
        animation: `fade-up 0.5s ease-out ${delay}ms forwards`,
      }}
    >
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
      )}
      {/* Corner accent that shows on hover */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-dim mb-2">
        {label}
      </p>
      <p
        className={`text-3xl font-display font-bold tracking-tight leading-none ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {value}
      </p>
      <div className="flex items-center justify-between mt-2 min-h-[1rem]">
        {subtitle && (
          <p className="text-[11px] font-mono text-ink-dim lowercase">
            {subtitle}
          </p>
        )}
        {trend && trendValue && (
          <span
            className={`text-[11px] font-mono font-medium ${trendColor} ml-auto`}
          >
            {trendArrow} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

import { approvalForMb, formatPct, mbTone } from "@/lib/margin-calculator";
import { cn } from "@/lib/cn";

type Props = {
  mb: number;
  size?: number;
  className?: string;
};

export function MbGauge({ mb, size = 140, className }: Props) {
  const pct = Math.min(50, Math.max(0, mb * 100));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 50) * c;
  const tone = mbTone(mb);
  const strokeColor =
    tone === "green" ? "#4ade80" : tone === "amber" ? "#fbbf24" : "#f87171";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor}44)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono-num text-3xl font-semibold text-white">{formatPct(mb, 1)}</span>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">MB</span>
      </div>
      <div className="mt-2 flex gap-3 text-[10px] text-zinc-600">
        <span className={pct >= 32 ? "text-emerald-400" : ""}>32</span>
        <span className={pct >= 29 && pct < 32 ? "text-amber-400" : ""}>29</span>
        <span className={pct < 29 ? "text-red-400" : ""}>26</span>
      </div>
    </div>
  );
}

export function ApprovalChip({ mb }: { mb: number }) {
  const level = approvalForMb(mb);
  const tone = mbTone(mb);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "green" && "bg-emerald-500/15 text-emerald-300",
        tone === "amber" && "bg-amber-500/15 text-amber-300",
        tone === "red" && "bg-red-500/15 text-red-300",
      )}
    >
      {level}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3",
        highlight ? "glass bg-taking-muted shadow-glow" : "bg-surface-overlay/60",
      )}
    >
      <div className="text-[11px] text-zinc-500">{label}</div>
      <div className={cn("mono-num mt-1 text-lg font-semibold", highlight && "text-taking")}>
        {value}
      </div>
    </div>
  );
}

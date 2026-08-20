import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/cn";

export function LockableInput({
  label,
  value,
  onChange,
  locked,
  onToggleLock,
  suffix,
  hint,
  step = "0.01",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  locked: boolean;
  onToggleLock: () => void;
  suffix?: string;
  hint?: string;
  step?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-muted">{label}</label>
        <button
          type="button"
          onClick={onToggleLock}
          title={locked ? "Destravar campo" : "Travar campo"}
          aria-pressed={locked}
          className={cn(
            "rounded-md p-1 transition-colors",
            locked ? "text-taking" : "text-muted/70 hover:text-foreground",
          )}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="relative">
        <input
          type="number"
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={cn(
            "mono-num w-full rounded-xl border bg-surface-overlay py-2.5 pl-3 text-sm text-foreground outline-none focus:ring-1",
            suffix ? "pr-10" : "pr-3",
            locked
              ? "border-taking/40 focus:border-taking/60 focus:ring-taking/30"
              : "border-border/15 focus:border-taking/50 focus:ring-taking/30",
          )}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1.5 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

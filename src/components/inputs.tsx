import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { PROFILE_NAMES } from "@/lib/margin-calculator";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export function ProfileSearch({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROFILE_NAMES.slice(0, 12);
    return PROFILE_NAMES.filter((p) => p.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <label className="mb-1.5 block text-xs font-medium text-muted">Perfil</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/80" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar perfil…"
          className="w-full rounded-xl border border-border/15 bg-surface-overlay py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-taking/50 focus:ring-1 focus:ring-taking/30"
        />
      </div>
      {open && options.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border/15 bg-surface-overlay shadow-2xl">
          {options.map((p) => (
            <li key={p}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-foreground/90 hover:bg-taking-muted hover:text-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(p);
                  setQuery(p);
                  setOpen(false);
                }}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PillSelect<T extends string | number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
              value === o.value
                ? "bg-taking text-white shadow-glow"
                : "bg-surface-overlay text-muted hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MoneyInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mono-num w-full rounded-xl border border-border/15 bg-surface-overlay px-3 py-2.5 text-sm text-foreground outline-none focus:border-taking/50"
      />
      {hint && <div className="mt-1.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function MbSlider({
  value,
  onChange,
  label = "Margem bruta alvo",
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted">{label}</label>
        <span className="mono-num text-sm font-semibold text-taking">{pct}%</span>
      </div>
      <input
        type="range"
        min={15}
        max={50}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-taking"
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted/80">
        <span>15%</span>
        <span>32%</span>
        <span>50%</span>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export function CompetencySearch({
  value,
  names,
  onChange,
  className,
}: {
  value: string;
  names: string[];
  onChange: (v: string) => void;
  className?: string;
}) {
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
    if (!q) return names.slice(0, 14);
    return names.filter((p) => p.toLowerCase().includes(q)).slice(0, 14);
  }, [names, query]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        2. Competência técnica
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/80" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Digite para buscar ou selecione na lista…"
          className="w-full rounded-xl border border-border/15 bg-surface-overlay py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-taking/50 focus:ring-1 focus:ring-taking/30"
        />
      </div>
      {open && options.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border/15 bg-surface-raised shadow-2xl">
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

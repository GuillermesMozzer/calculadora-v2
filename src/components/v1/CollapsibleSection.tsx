import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function CollapsibleSection({
  title,
  subtitle,
  step,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
      >
        {step != null && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-taking-muted text-xs font-semibold text-taking">
            {step}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground/90">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="border-t border-border/10 px-4 pb-5 pt-4 sm:px-5">{children}</div> : null}
    </section>
  );
}

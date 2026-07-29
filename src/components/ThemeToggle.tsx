import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  variant?: "fixed" | "inline";
}

export function ThemeToggle({ className, variant = "inline" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-raised/90 text-foreground transition-colors hover:border-taking/40 hover:bg-taking-muted hover:text-taking",
        variant === "fixed" &&
          "fixed right-4 top-4 z-[100] shadow-lg backdrop-blur-md",
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

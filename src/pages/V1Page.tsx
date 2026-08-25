import { useState } from "react";
import { CircleHelp, LogOut } from "lucide-react";
import { Navigate } from "react-router-dom";
import { TakingLogo } from "@/components/TakingLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { V1Calculator } from "@/components/v1/V1Calculator";
import { useAuth } from "@/contexts/AuthContext";

export default function V1Page() {
  const { user, logout } = useAuth();
  const [replayTour, setReplayTour] = useState(0);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/10 bg-surface-raised/85 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <TakingLogo height={28} className="max-w-[120px] object-contain object-left sm:max-w-[140px]" />
          <p className="hidden text-[10px] font-medium uppercase tracking-widest text-taking sm:block">
            Calculadora V1
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground/90">{user.name}</p>
            <p className="text-xs text-muted/80">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setReplayTour((n) => n + 1)}
            title="Abrir tutorial"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-taking/40 bg-taking-muted px-3 text-xs font-semibold text-taking transition-colors hover:border-taking hover:bg-taking hover:text-white"
          >
            <CircleHelp className="h-4 w-4" />
            Tutorial
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            title="Sair"
            className="rounded-xl border border-border/15 p-2 text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-5 lg:hidden">
          <h1 className="text-lg font-semibold">Precificação</h1>
          <p className="text-sm text-muted">Passo a passo · Ratecard Taking ou BTG</p>
        </div>
        <V1Calculator replayTour={replayTour} />
      </main>
    </div>
  );
}

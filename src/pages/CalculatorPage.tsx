import { useState } from "react";
import { LogOut } from "lucide-react";
import { Navigate } from "react-router-dom";
import {
  Activity,
  Calculator,
  LayoutGrid,
  Users,
} from "lucide-react";
import { TakingLogo } from "@/components/TakingLogo";
import { ModePrecificar } from "@/components/ModePrecificar";
import { ModeRatecard } from "@/components/ModeRatecard";
import { ModeTime } from "@/components/ModeTime";
import { ModeSaude } from "@/components/ModeSaude";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";

const MODES = [
  {
    id: "precificar",
    label: "Precificar",
    desc: "Perfil individual com simuladores",
    icon: Calculator,
  },
  {
    id: "ratecard",
    label: "Ratecard",
    desc: "Tabela de referência de mercado",
    icon: LayoutGrid,
  },
  {
    id: "time",
    label: "Montar Time",
    desc: "Proposta comercial e alçadas",
    icon: Users,
  },
  {
    id: "saude",
    label: "Saúde",
    desc: "Margem real da operação",
    icon: Activity,
  },
] as const;

type ModeId = (typeof MODES)[number]["id"];

export default function CalculatorPage() {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState<ModeId>("precificar");

  if (!user) return <Navigate to="/" replace />;

  const active = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex min-h-screen">
      <aside className="glass fixed inset-y-0 left-0 z-40 flex w-[72px] flex-col border-r md:w-56">
        <div className="border-b border-white/[0.06] px-3 py-4 md:px-4 md:py-5">
          <TakingLogo
            height={32}
            className="mx-auto max-w-[140px] object-contain md:mx-0 md:max-w-[180px] md:object-left"
          />
          <p className="mt-2 hidden text-[10px] font-medium uppercase tracking-widest text-taking md:block">
            Calculadora V2
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  on
                    ? "bg-taking-muted text-white shadow-glow"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
                )}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", on ? "text-taking" : "text-zinc-600")}
                />
                <div className="hidden min-w-0 md:block">
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="truncate text-[10px] text-zinc-600 group-hover:text-zinc-500">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/[0.06] p-4 text-[10px] text-zinc-600 md:block">
          Grupo Taking
        </div>
      </aside>

      <main className="ml-[72px] flex min-h-screen flex-1 flex-col md:ml-56">
        <header className="sticky top-0 z-30 flex items-start justify-between gap-4 border-b border-white/[0.06] bg-surface/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div>
            <h1 className="text-xl font-semibold text-white">{active.label}</h1>
            <p className="mt-0.5 text-sm text-zinc-500">{active.desc}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-300">{user.name}</p>
              <p className="text-xs text-zinc-600">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sair"
              className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {mode === "precificar" && <ModePrecificar />}
          {mode === "ratecard" && <ModeRatecard />}
          {mode === "time" && <ModeTime />}
          {mode === "saude" && <ModeSaude />}
        </div>
      </main>
    </div>
  );
}

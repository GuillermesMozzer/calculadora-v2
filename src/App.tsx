import { useState } from "react";
import {
  Activity,
  Calculator,
  LayoutGrid,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ModePrecificar } from "./components/ModePrecificar";
import { ModeRatecard } from "./components/ModeRatecard";
import { ModeTime } from "./components/ModeTime";
import { ModeSaude } from "./components/ModeSaude";

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

export default function App() {
  const [mode, setMode] = useState<ModeId>("precificar");
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex min-h-screen">
      <aside className="glass fixed inset-y-0 left-0 z-40 flex w-[72px] flex-col border-r md:w-56">
        <div className="border-b border-white/[0.06] px-4 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-taking font-bold text-white">
              T
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-tight text-white">Calculadora</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-taking">V2</p>
            </div>
          </div>
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
          Taking · Precificação de talentos
        </div>
      </aside>

      <main className="ml-[72px] flex min-h-screen flex-1 flex-col md:ml-56">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-surface/80 px-4 py-4 backdrop-blur-xl sm:px-8">
          <h1 className="text-xl font-semibold text-white">{active.label}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{active.desc}</p>
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

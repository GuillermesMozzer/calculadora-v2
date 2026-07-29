import { useMemo, useState } from "react";
import {
  SALARY_ROWS,
  SENIORITY_LABEL,
  computeCost,
  formatBRL,
  formatPct,
  mbTone,
  type ContractModel,
} from "@/lib/margin-calculator";
import { MbSlider, PillSelect } from "./inputs";
import { cn } from "@/lib/cn";

export function ModeRatecard() {
  const [q, setQ] = useState("");
  const [model, setModel] = useState<ContractModel>("PJ");
  const [mb, setMb] = useState(0.32);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SALARY_ROWS.filter((r) => !needle || r.profile.toLowerCase().includes(needle)).map(
      (r) => {
        const salary = model === "PJ" ? r.pj : model === "CLT_FULL" ? r.clt : r.cltDa;
        const calc = computeCost({
          salary,
          model,
          targetMb: mb,
          hours: 168,
          infra: "none",
          finder: "none",
        });
        return { ...r, salary, calc };
      },
    );
  }, [q, model, mb]);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-300">
        Ratecard de referência — para negociar salário, use Precificar ou Montar Time.
      </div>

      <div className="glass grid gap-4 rounded-2xl p-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Buscar perfil</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: Mainframe, React…"
            className="w-full rounded-xl border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-taking/50"
          />
        </div>
        <PillSelect
          label="Modelo"
          value={model}
          onChange={setModel}
          options={[
            { value: "PJ", label: "PJ" },
            { value: "CLT_FULL", label: "CLT" },
            { value: "CLT_ESTRATEGICO", label: "CLT DA" },
          ]}
        />
        <MbSlider value={mb} onChange={setMb} label="MB para cálculo" />
      </div>

      <div className="text-xs text-zinc-500">{rows.length} perfis</div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface-overlay text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Nível</th>
                <th className="px-4 py-3 text-right font-medium">Base</th>
                <th className="px-4 py-3 text-right font-medium">Custo</th>
                <th className="px-4 py-3 text-right font-medium">Venda</th>
                <th className="px-4 py-3 text-right font-medium">MB</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tone = mbTone(r.calc.mbReal);
                return (
                  <tr
                    key={`${r.profile}-${r.seniority}`}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-2.5 text-zinc-200">{r.profile}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{SENIORITY_LABEL[r.seniority]}</td>
                    <td className="mono-num px-4 py-2.5 text-right text-zinc-400">
                      {formatBRL(r.salary)}
                    </td>
                    <td className="mono-num px-4 py-2.5 text-right">{formatBRL(r.calc.costMonthly)}</td>
                    <td className="mono-num px-4 py-2.5 text-right font-medium text-white">
                      {formatBRL(r.calc.saleMonthly)}
                    </td>
                    <td
                      className={cn(
                        "mono-num px-4 py-2.5 text-right font-medium",
                        tone === "green" && "text-emerald-400",
                        tone === "amber" && "text-amber-400",
                        tone === "red" && "text-red-400",
                      )}
                    >
                      {formatPct(r.calc.mbReal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

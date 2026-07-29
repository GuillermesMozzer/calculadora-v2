import { useEffect, useMemo, useState } from "react";
import {
  SENIORITY_LABEL,
  baseSalaryFor,
  computeCost,
  formatBRL,
  formatDelta,
  formatPct,
  mbFromRevenue,
  saleFromMb,
  type ContractModel,
  type FinderOption,
  type HoursOption,
  type InfraOption,
  type Seniority,
} from "@/lib/margin-calculator";
import { ApprovalChip, MbGauge, MetricTile } from "./shared";
import { MbSlider, MoneyInput, PillSelect, ProfileSearch } from "./inputs";

const SENIORITIES: Seniority[] = ["Jr", "Pl", "Sr", "Esp"];

export function ModePrecificar() {
  const [profile, setProfile] = useState("Desenvolvedor Full Stack");
  const [seniority, setSeniority] = useState<Seniority>("Pl");
  const [model, setModel] = useState<ContractModel>("PJ");
  const [salary, setSalary] = useState(0);
  const [mb, setMb] = useState(0.32);
  const [hours, setHours] = useState<HoursOption>(168);
  const [infra, setInfra] = useState<InfraOption>("none");
  const [finder, setFinder] = useState<FinderOption>("none");
  const [simRevenue, setSimRevenue] = useState(0);
  const [simMb, setSimMb] = useState(0.32);

  const base = baseSalaryFor(profile, seniority, model);
  useEffect(() => setSalary(base), [base]);

  const result = useMemo(
    () => computeCost({ salary, model, targetMb: mb, hours, infra, finder }),
    [salary, model, mb, hours, infra, finder],
  );

  const delta = formatDelta(salary, base);
  const scenarios = [0.32, 0.29, 0.26].map((target) => {
    const r = computeCost({ salary, model, targetMb: target, hours, infra, finder });
    return { target, sale: r.saleMonthly, hour: r.saleHourly };
  });

  const simMbResult = mbFromRevenue(result.costMonthly, simRevenue || result.saleMonthly);
  const simSale = saleFromMb(result.costMonthly, simMb);

  return (
    <div className="animate-fade-in grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground/90">Perfil & contrato</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileSearch value={profile} onChange={setProfile} className="sm:col-span-2" />
            <PillSelect
              label="Senioridade"
              value={seniority}
              onChange={setSeniority}
              options={SENIORITIES.map((s) => ({ value: s, label: SENIORITY_LABEL[s] }))}
            />
            <PillSelect
              label="Modelo"
              value={model}
              onChange={setModel}
              options={[
                { value: "PJ", label: "PJ" },
                { value: "CLT_FULL", label: "CLT Full" },
                { value: "CLT_ESTRATEGICO", label: "CLT Estratégico" },
              ]}
            />
            <MoneyInput
              label="Salário adotado"
              value={salary}
              onChange={setSalary}
              hint={
                <span className="flex flex-wrap items-center gap-2">
                  <span>Base: {formatBRL(base)}</span>
                  <button
                    type="button"
                    className="text-taking hover:underline"
                    onClick={() => setSalary(base)}
                  >
                    Restaurar
                  </button>
                  <span
                    className={
                      delta.kind === "below"
                        ? "text-emerald-400"
                        : delta.kind === "above"
                          ? "text-red-400"
                          : ""
                    }
                  >
                    {delta.text}
                  </span>
                </span>
              }
            />
            <MbSlider value={mb} onChange={setMb} />
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground/90">Parâmetros operacionais</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PillSelect
              label="Horas/mês"
              value={hours}
              onChange={setHours}
              options={[
                { value: 80, label: "80h" },
                { value: 168, label: "168h" },
                { value: 176, label: "176h" },
                { value: 220, label: "220h" },
              ]}
            />
            <PillSelect
              label="INFRA"
              value={infra}
              onChange={setInfra}
              options={[
                { value: "notebook", label: "Notebook" },
                { value: "macbook", label: "MacBook" },
                { value: "none", label: "Sem" },
              ]}
            />
            <PillSelect
              label="Finder"
              value={finder}
              onChange={setFinder}
              options={[
                { value: "none", label: "Nenhum" },
                { value: "interno", label: "Interno 3%" },
                { value: "externo", label: "Externo 3%" },
                { value: "ambos", label: "Ambos 6%" },
              ]}
            />
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground/90">Cenários de alçada</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {scenarios.map((s) => (
              <div key={s.target} className="rounded-xl bg-surface-overlay/80 p-3">
                <div className="text-xs font-semibold text-taking">MB {(s.target * 100).toFixed(0)}%</div>
                <div className="mono-num mt-1 text-sm text-foreground">{formatBRL(s.sale)}/mês</div>
                <div className="mono-num text-xs text-muted">{formatBRL(s.hour)}/h</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground/90">Breakdown de custo</h2>
          <div className="max-h-52 overflow-auto rounded-xl border border-border/10">
            <table className="w-full text-xs">
              <tbody>
                {result.breakdown.map((line) => (
                  <tr key={line.label} className="border-b border-border/10">
                    <td className="px-3 py-2 text-muted">{line.label}</td>
                    <td className="mono-num px-3 py-2 text-right text-foreground/90">
                      {formatBRL(line.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground/90">Simular por receita</h3>
            <MoneyInput
              label="Receita desejada (R$/mês)"
              value={simRevenue || result.saleMonthly}
              onChange={setSimRevenue}
            />
            <p className="mt-3 text-sm text-muted">
              MB resultante:{" "}
              <span className="mono-num font-semibold text-foreground">{formatPct(simMbResult)}</span>
            </p>
            <div className="mt-2">
              <ApprovalChip mb={simMbResult} />
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground/90">Simular por margem</h3>
            <MbSlider value={simMb} onChange={setSimMb} label="MB desejado" />
            <p className="mt-3 text-sm text-muted">
              Receita:{" "}
              <span className="mono-num font-semibold text-foreground">{formatBRL(simSale)}</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Hora:{" "}
              <span className="mono-num font-semibold text-foreground">
                {formatBRL(simSale / hours)}
              </span>
            </p>
          </div>
        </section>
      </div>

      <aside className="animate-slide-up xl:sticky xl:top-6 xl:self-start">
        <div className="glass overflow-hidden rounded-2xl shadow-glow">
          <div className="border-b border-border/10 bg-taking-muted px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-taking">Preço de venda</p>
            <p className="mono-num mt-1 text-4xl font-bold text-foreground">
              {formatBRL(result.saleHourly)}
              <span className="text-lg font-normal text-muted">/h</span>
            </p>
            <p className="mono-num mt-1 text-sm text-muted">{formatBRL(result.saleMonthly)}/mês</p>
          </div>
          <div className="flex flex-col items-center px-5 py-6">
            <MbGauge mb={result.mbReal} />
            <div className="mt-4">
              <ApprovalChip mb={result.mbReal} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-border/10 p-4">
            <MetricTile label="Custo/h" value={formatBRL(result.costHourly)} />
            <MetricTile label="Custo/mês" value={formatBRL(result.costMonthly)} />
            <MetricTile label="Impostos" value={formatBRL(result.taxes)} />
            <MetricTile label="Margem R$" value={formatBRL(result.marginReais)} highlight />
          </div>
        </div>
      </aside>
    </div>
  );
}

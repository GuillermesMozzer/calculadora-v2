import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  MODEL_LABEL,
  SENIORITY_LABEL,
  baseSalaryFor,
  computeCost,
  formatBRL,
  formatPct,
  healthStatus,
  mbTone,
  operationMargin,
  type ContractModel,
  type Seniority,
} from "@/lib/margin-calculator";
import { ApprovalChip, MbGauge } from "./shared";
import { MoneyInput, PillSelect, ProfileSearch } from "./inputs";
import { cn } from "@/lib/cn";

type OpMember = {
  id: string;
  contract: string;
  profile: string;
  seniority: Seniority;
  model: ContractModel;
  salary: number;
  hours: 80 | 168 | 176;
  saleMonthly: number;
};

export function ModeSaude() {
  const [contract, setContract] = useState("");
  const [profile, setProfile] = useState("Desenvolvedor Full Stack");
  const [seniority, setSeniority] = useState<Seniority>("Pl");
  const [model, setModel] = useState<ContractModel>("PJ");
  const [salary, setSalary] = useState(0);
  const [hours, setHours] = useState<80 | 168 | 176>(168);
  const [saleMonthly, setSaleMonthly] = useState(0);
  const [ops, setOps] = useState<OpMember[]>([]);

  const base = baseSalaryFor(profile, seniority, model);
  useEffect(() => setSalary(base), [base]);

  const rows = useMemo(
    () =>
      ops.map((o) => {
        const cost = computeCost({
          salary: o.salary,
          model: o.model,
          targetMb: 0.32,
          hours: o.hours,
          infra: "none",
          finder: "none",
        }).costMonthly;
        const m = operationMargin(cost, o.saleMonthly);
        return { ...o, cost, ...m, hourly: o.hours > 0 ? o.saleMonthly / o.hours : 0 };
      }),
    [ops],
  );

  const consolidated = useMemo(() => {
    const revenue = rows.reduce((s, r) => s + r.saleMonthly, 0);
    const cost = rows.reduce((s, r) => s + r.cost, 0);
    const taxes = rows.reduce((s, r) => s + r.taxes, 0);
    const margin = rows.reduce((s, r) => s + r.marginReais, 0);
    const mb = revenue > 0 ? margin / revenue : 0;
    return { n: rows.length, revenue, cost, taxes, margin, mb, annual: revenue * 12 };
  }, [rows]);

  const status = healthStatus(consolidated.mb);
  const tone = mbTone(consolidated.mb);

  function add() {
    if (!saleMonthly || saleMonthly <= 0) return;
    setOps((list) => [
      ...list,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        contract: contract.trim() || "—",
        profile,
        seniority,
        model,
        salary,
        hours,
        saleMonthly,
      },
    ]);
    setContract("");
    setSaleMonthly(0);
  }

  const pyramid = [
    { label: "Receita", value: consolidated.revenue, pct: 100, color: "bg-sky-500" },
    {
      label: "Impostos",
      value: consolidated.taxes,
      pct: consolidated.revenue > 0 ? (consolidated.taxes / consolidated.revenue) * 100 : 0,
      color: "bg-red-400",
    },
    {
      label: "Custo",
      value: consolidated.cost,
      pct: consolidated.revenue > 0 ? (consolidated.cost / consolidated.revenue) * 100 : 0,
      color: "bg-amber-400",
    },
    {
      label: "Margem",
      value: consolidated.margin,
      pct: consolidated.revenue > 0 ? (consolidated.margin / consolidated.revenue) * 100 : 0,
      color: "bg-emerald-400",
    },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <section className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground/90">Registrar alocação</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Contrato / Cliente</label>
            <input
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              placeholder="Ex: Banco ABC — SAP"
              className="w-full rounded-xl border border-border/15 bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-taking/50"
            />
          </div>
          <ProfileSearch value={profile} onChange={setProfile} />
          <PillSelect
            label="Senioridade"
            value={seniority}
            onChange={setSeniority}
            options={(["Jr", "Pl", "Sr", "Esp"] as Seniority[]).map((s) => ({
              value: s,
              label: SENIORITY_LABEL[s],
            }))}
          />
          <MoneyInput label="Salário" value={salary} onChange={setSalary} hint={`Base: ${formatBRL(base)}`} />
          <PillSelect
            label="Modelo"
            value={model}
            onChange={setModel}
            options={[
              { value: "PJ", label: "PJ" },
              { value: "CLT_FULL", label: "CLT Full" },
              { value: "CLT_ESTRATEGICO", label: "CLT DA" },
            ]}
          />
          <PillSelect
            label="Horas"
            value={hours}
            onChange={setHours}
            options={[
              { value: 80, label: "80h" },
              { value: 168, label: "168h" },
              { value: 176, label: "176h" },
            ]}
          />
          <MoneyInput
            label="Venda real (R$/mês)"
            value={saleMonthly}
            onChange={setSaleMonthly}
          />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={saleMonthly <= 0}
          className="mt-4 rounded-xl bg-taking px-4 py-2.5 text-sm font-semibold text-white hover:bg-taking-hover disabled:opacity-40"
        >
          Incluir na operação
        </button>
      </section>

      {ops.length > 0 && (
        <>
          <div className="glass flex flex-col items-center rounded-2xl p-6 md:flex-row md:justify-around md:gap-8">
            <MbGauge mb={consolidated.mb} size={160} />
            <div className="mt-4 text-center md:mt-0 md:text-left">
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-widest",
                  tone === "green" && "text-emerald-400",
                  tone === "amber" && "text-amber-400",
                  tone === "red" && "text-red-400",
                )}
              >
                {status}
              </p>
              <p className="mt-2 text-muted">
                {consolidated.n} profissionais · Receita {formatBRL(consolidated.revenue)}/mês
              </p>
              <div className="mt-3">
                <ApprovalChip mb={consolidated.mb} />
              </div>
            </div>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground/90">Pirâmide financeira</h3>
            <div className="space-y-2">
              {pyramid.map((p) => (
                <div key={p.label} className="flex items-center gap-3 text-xs">
                  <span className="w-20 shrink-0 text-muted">{p.label}</span>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-foreground/5">
                    <div
                      className={cn(
                        "flex h-full items-center px-2 font-semibold text-zinc-900",
                        p.color,
                      )}
                      style={{ width: `${Math.max(4, Math.min(100, p.pct))}%` }}
                    >
                      {formatBRL(p.value)}
                    </div>
                  </div>
                  <span className="mono-num w-12 shrink-0 text-right text-muted">
                    {p.pct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground/90">Alocados</h3>
            <button
              type="button"
              onClick={() => setOps([])}
              className="text-xs text-red-400 hover:underline"
            >
              Limpar tudo
            </button>
          </div>

          <div className="glass overflow-auto rounded-2xl">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="bg-surface-overlay text-muted">
                <tr>
                  {["Contrato", "Perfil", "Venda/m", "Custo/m", "Hora", "MB", ""].map((h) => (
                    <th key={h || "x"} className="px-3 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/10">
                    <td className="px-3 py-2">{r.contract}</td>
                    <td className="px-3 py-2">
                      {r.profile}
                      <span className="ml-1 text-muted/80">
                        · {SENIORITY_LABEL[r.seniority]} · {MODEL_LABEL[r.model]}
                      </span>
                    </td>
                    <td className="mono-num px-3 py-2">{formatBRL(r.saleMonthly)}</td>
                    <td className="mono-num px-3 py-2 text-muted">{formatBRL(r.cost)}</td>
                    <td className="mono-num px-3 py-2 font-semibold text-taking">
                      {formatBRL(r.hourly)}
                    </td>
                    <td
                      className={cn(
                        "mono-num px-3 py-2",
                        mbTone(r.mb) === "green" && "text-emerald-400",
                        mbTone(r.mb) === "amber" && "text-amber-400",
                        mbTone(r.mb) === "red" && "text-red-400",
                      )}
                    >
                      {formatPct(r.mb)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setOps((list) => list.filter((x) => x.id !== r.id))}
                        className="text-muted/80 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {ops.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/15 py-16 text-center text-sm text-muted">
          Adicione profissionais alocados com o valor de venda real para monitorar a saúde da operação.
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  MODEL_LABEL,
  SENIORITY_LABEL,
  alcadaForAnnualRevenue,
  baseSalaryFor,
  computeCost,
  formatBRL,
  formatPct,
  mbTone,
  type ContractModel,
  type FinderOption,
  type InfraOption,
  type Seniority,
} from "@/lib/margin-calculator";
import { ApprovalChip, MetricTile } from "./shared";
import { MbSlider, MoneyInput, PillSelect, ProfileSearch } from "./inputs";
import { cn } from "@/lib/cn";

type TeamMember = {
  id: string;
  profile: string;
  seniority: Seniority;
  model: ContractModel;
  salary: number;
  base: number;
  hours: 80 | 168 | 176;
  infra: InfraOption;
  finder: FinderOption;
};

export function ModeTime() {
  const [profile, setProfile] = useState("Desenvolvedor Full Stack");
  const [seniority, setSeniority] = useState<Seniority>("Pl");
  const [model, setModel] = useState<ContractModel>("PJ");
  const [salary, setSalary] = useState(0);
  const [hours, setHours] = useState<80 | 168 | 176>(168);
  const [infra, setInfra] = useState<InfraOption>("none");
  const [finder, setFinder] = useState<FinderOption>("none");
  const [mb, setMb] = useState(0.32);
  const [months, setMonths] = useState<3 | 6 | 9 | 12>(12);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showProposal, setShowProposal] = useState(false);
  const [client, setClient] = useState("");
  const [complexity, setComplexity] = useState<0.35 | 0.32 | 0.28>(0.32);

  const base = baseSalaryFor(profile, seniority, model);
  useEffect(() => setSalary(base), [base]);

  const proposalMb = showProposal ? complexity : mb;

  const membersCalc = useMemo(
    () =>
      team.map((m) => ({
        m,
        calc: computeCost({
          salary: m.salary,
          model: m.model,
          targetMb: proposalMb,
          hours: m.hours,
          infra: m.infra,
          finder: m.finder,
        }),
      })),
    [team, proposalMb],
  );

  const totals = useMemo(() => {
    const cost = membersCalc.reduce((s, x) => s + x.calc.costMonthly, 0);
    const revenue = membersCalc.reduce((s, x) => s + x.calc.saleMonthly, 0);
    const margin = membersCalc.reduce((s, x) => s + x.calc.marginReais, 0);
    const weightedMb = revenue > 0 ? margin / revenue : 0;
    return {
      cost,
      revenue,
      margin,
      weightedMb,
      period: revenue * months,
      annual: revenue * 12,
    };
  }, [membersCalc, months]);

  function addMember() {
    setTeam((t) => [
      ...t,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        profile,
        seniority,
        model,
        salary,
        base,
        hours,
        infra,
        finder,
      },
    ]);
  }

  return (
    <div className="animate-fade-in space-y-5">
      <section className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">Adicionar profissional</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ProfileSearch value={profile} onChange={setProfile} className="md:col-span-2" />
          <PillSelect
            label="Senioridade"
            value={seniority}
            onChange={setSeniority}
            options={(["Jr", "Pl", "Sr", "Esp"] as Seniority[]).map((s) => ({
              value: s,
              label: SENIORITY_LABEL[s],
            }))}
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
          <MoneyInput label="Salário" value={salary} onChange={setSalary} hint={`Base: ${formatBRL(base)}`} />
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
          <MbSlider value={mb} onChange={setMb} />
        </div>
        <button
          type="button"
          onClick={addMember}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-taking px-4 py-2.5 text-sm font-semibold text-white hover:bg-taking-hover"
        >
          <Plus className="h-4 w-4" />
          Adicionar ao time
        </button>
      </section>

      {team.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile label="Custo/mês" value={formatBRL(totals.cost)} />
            <MetricTile label="Receita/mês" value={formatBRL(totals.revenue)} highlight />
            <MetricTile label="MB ponderada" value={formatPct(totals.weightedMb)} />
            <MetricTile label={`Total ${months}m`} value={formatBRL(totals.period)} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ApprovalChip mb={totals.weightedMb} />
            <span className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
              Alçada: {alcadaForAnnualRevenue(totals.annual)}
            </span>
            <PillSelect
              label=""
              value={months}
              onChange={setMonths}
              options={[
                { value: 3, label: "3m" },
                { value: 6, label: "6m" },
                { value: 9, label: "9m" },
                { value: 12, label: "12m" },
              ]}
            />
          </div>

          <div className="space-y-3">
            {membersCalc.map(({ m, calc }) => (
              <div key={m.id} className="glass rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{m.profile}</p>
                    <p className="text-xs text-zinc-500">
                      {SENIORITY_LABEL[m.seniority]} · {MODEL_LABEL[m.model]} · {m.hours}h
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTeam((t) => t.filter((x) => x.id !== m.id))}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-zinc-600">Venda/h</p>
                    <p className="mono-num text-lg font-semibold text-taking">
                      {formatBRL(calc.saleHourly)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-zinc-600">Venda/mês</p>
                    <p className="mono-num text-lg text-white">{formatBRL(calc.saleMonthly)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-zinc-600">MB</p>
                    <p
                      className={cn(
                        "mono-num text-lg font-semibold",
                        mbTone(calc.mbReal) === "green" && "text-emerald-400",
                        mbTone(calc.mbReal) === "amber" && "text-amber-400",
                        mbTone(calc.mbReal) === "red" && "text-red-400",
                      )}
                    >
                      {formatPct(calc.mbReal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowProposal((v) => !v)}
            className="rounded-xl border border-taking/40 px-4 py-2 text-sm font-semibold text-taking hover:bg-taking-muted"
          >
            {showProposal ? "Ocultar proposta" : "Gerar proposta comercial"}
          </button>

          {showProposal && (
            <div className="glass space-y-4 rounded-2xl border-taking/20 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-500">Cliente</label>
                  <input
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full rounded-xl border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-taking/50"
                  />
                </div>
                <PillSelect
                  label="Complexidade"
                  value={complexity}
                  onChange={(v) => {
                    setComplexity(v);
                    setMb(v);
                  }}
                  options={[
                    { value: 0.35, label: "Alta 35%" },
                    { value: 0.32, label: "Média 32%" },
                    { value: 0.28, label: "Baixa 28%" },
                  ]}
                />
              </div>
              <p className="text-sm text-zinc-400">
                Proposta{client ? ` — ${client}` : ""} · MB {formatPct(proposalMb)}
              </p>
              <div className="overflow-auto rounded-xl border border-white/5">
                <table className="w-full min-w-[640px] text-xs">
                  <thead className="bg-surface-overlay text-zinc-500">
                    <tr>
                      {["Perfil", "Nível", "Modelo", "Salário", "Venda/mês", "Venda/h", "MB"].map(
                        (h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {membersCalc.map(({ m, calc }) => (
                      <tr key={m.id} className="border-t border-white/[0.04]">
                        <td className="px-3 py-2">{m.profile}</td>
                        <td className="px-3 py-2">{SENIORITY_LABEL[m.seniority]}</td>
                        <td className="px-3 py-2">{MODEL_LABEL[m.model]}</td>
                        <td className="mono-num px-3 py-2">{formatBRL(m.salary)}</td>
                        <td className="mono-num px-3 py-2">{formatBRL(calc.saleMonthly)}</td>
                        <td className="mono-num px-3 py-2 font-semibold text-taking">
                          {formatBRL(calc.saleHourly)}
                        </td>
                        <td className="mono-num px-3 py-2">{formatPct(calc.mbReal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mono-num text-2xl font-bold text-taking">
                Total mensal: {formatBRL(totals.revenue)}
              </p>
              <ApprovalChip mb={totals.weightedMb} />
            </div>
          )}
        </>
      )}

      {team.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500">
          Monte seu time adicionando profissionais acima.
        </div>
      )}
    </div>
  );
}

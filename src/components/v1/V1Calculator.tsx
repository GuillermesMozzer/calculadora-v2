import { useState } from "react";
import { formatBRL, formatPct, MODEL_LABEL, SENIORITY_LABEL, type Seniority } from "@/lib/margin-calculator";
import { BTG_SENIORITIES, type BtgSeniority } from "@/lib/v1/btg-ratecard";
import { useV1Calculator } from "@/hooks/useV1Calculator";
import { PillSelect } from "@/components/inputs";
import { ApprovalChip, MbGauge, MetricTile } from "@/components/shared";
import { CollapsibleSection } from "@/components/v1/CollapsibleSection";
import { CompetencySearch } from "@/components/v1/CompetencySearch";
import { LockableInput } from "@/components/v1/LockableInput";
import type { ValueKey } from "@/lib/v1/solver";

const TAKING_SENIORITIES: Seniority[] = ["Jr", "Pl", "Sr", "Esp"];

export function V1Calculator() {
  const calc = useV1Calculator();
  const [open, setOpen] = useState({ perfil: true, valores: false, extras: false, breakdown: false });

  function toggle(key: keyof typeof open) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const { values, locks } = calc;

  return (
    <div className="animate-fade-in grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="order-2 space-y-4 lg:order-1">
        <CollapsibleSection
          title="Perfil e contrato"
          subtitle="Siga os 5 passos — a calculadora preenche o restante."
          open={open.perfil}
          onToggle={() => toggle("perfil")}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[220px] flex-1">
                <label className="mb-1.5 block text-xs font-medium text-muted">1. Tabela ratecard</label>
                <select
                  value={calc.table}
                  onChange={(e) => calc.setTable(e.target.value as "taking" | "btg")}
                  className="w-full rounded-xl border border-border/15 bg-surface-overlay px-3 py-2.5 text-sm text-foreground outline-none focus:border-taking/50 focus:ring-1 focus:ring-taking/30"
                >
                  <option value="taking">Ratecard Taking</option>
                  <option value="btg">Ratecard BTG</option>
                </select>
                <p className="mt-1.5 text-[11px] text-muted">
                  {calc.table === "taking"
                    ? "Tabela salarial Taking (PJ / CLT). Default da calculadora."
                    : "Faixa de venda em R$/hora · base 168h · modelo CLT. O valor praticado entra como hora de venda."}
                </p>
              </div>
              <CompetencySearch
                value={calc.profile}
                names={calc.profiles}
                onChange={calc.setProfile}
                className="min-w-[220px] flex-1"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="min-w-[200px] flex-[1.4]">
                <p className="mb-1.5 text-xs font-medium text-muted">3. Senioridade</p>
                {calc.table === "taking" ? (
                  <PillSelect
                    label=""
                    value={calc.takingSeniority}
                    onChange={(v) => calc.setSeniority(v)}
                    options={TAKING_SENIORITIES.map((s) => ({ value: s, label: SENIORITY_LABEL[s] }))}
                  />
                ) : (
                  <PillSelect
                    label=""
                    value={calc.btgSeniority}
                    onChange={(v) => calc.setSeniority(v as BtgSeniority)}
                    options={BTG_SENIORITIES.map((s) => ({ value: s.id, label: s.label }))}
                  />
                )}
              </div>
              <div className="min-w-[180px] flex-1">
                <PillSelect
                  label="4. Modelo de contratação"
                  value={calc.model}
                  onChange={calc.setModel}
                  options={[
                    { value: "CLT_FULL", label: MODEL_LABEL.CLT_FULL },
                    { value: "CLT_ESTRATEGICO", label: MODEL_LABEL.CLT_ESTRATEGICO },
                    { value: "PJ", label: MODEL_LABEL.PJ },
                  ]}
                />
              </div>
              <div className="min-w-[140px] flex-[0.8]">
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  5. Quantidade de horas / mês
                </label>
                <input
                  type="number"
                  min={1}
                  value={calc.hours}
                  onChange={(e) => calc.setHours(Number(e.target.value))}
                  className="mono-num w-full rounded-xl border border-border/15 bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-taking/50 focus:ring-1 focus:ring-taking/30"
                />
                <p className="mt-1.5 text-[11px] text-muted">Pré-preenchido em 168h.</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Calculadora"
          subtitle="Calculados automaticamente. Trave um campo com o cadeado para simular."
          open={open.valores}
          onToggle={() => toggle("valores")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LockField
              id="saleHourly"
              label="Valor hora de venda"
              suffix="R$/h"
              value={values.saleHourly}
              calc={calc}
              hint={
                calc.btgHint
                  ? `Faixa BTG: R$ ${calc.btgHint.min} – ${calc.btgHint.max}/h`
                  : undefined
              }
            />
            <LockField
              id="employeeHourly"
              label="Valor hora ao funcionário"
              suffix="R$/h"
              value={values.employeeHourly}
              calc={calc}
            />
            <LockField
              id="costHourly"
              label="Custo hora real Taking"
              suffix="R$/h"
              value={values.costHourly}
              calc={calc}
            />
            <LockField
              id="salary"
              label="Salário ao funcionário"
              suffix="R$"
              value={values.salary}
              calc={calc}
            />
            <LockField
              id="costMonthly"
              label="Custo mês real Taking"
              suffix="R$"
              value={values.costMonthly}
              calc={calc}
            />
            <LockableInput
              label="Margem bruta alvo"
              suffix="%"
              value={Math.round(values.mbPct * 1000) / 10}
              onChange={(v) => calc.editValue("mbPct", v)}
              locked={locks.mbPct}
              onToggleLock={() => calc.toggleLock("mbPct")}
              hint="Trave a % e altere a hora de venda — o restante se ajusta."
            />
            <LockField
              id="mbReais"
              label="Margem bruta alvo"
              suffix="R$"
              value={values.mbReais}
              calc={calc}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Recursos e benefícios adicionais"
          subtitle="Entram no custo. Podem ser alterados a qualquer momento."
          open={open.extras}
          onToggle={() => toggle("extras")}
        >
          <div className="space-y-5">
            <PillSelect
              label="Máquina fornecida"
              value={calc.infra}
              onChange={calc.setInfra}
              options={[
                { value: "notebook", label: "Notebook" },
                { value: "macbook", label: "MacBook" },
                { value: "none", label: "Sem máquina" },
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Vale alimentação</label>
                <input
                  type="number"
                  value={calc.va}
                  onChange={(e) => calc.setVa(Number(e.target.value) || 0)}
                  className="mono-num w-full rounded-xl border border-border/15 bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-taking/50"
                />
                <p className="mt-1.5 text-[11px] text-muted">
                  Regra: até 5k → R$ 500 · até 10k → R$ 1.000 · até 15k → R$ 1.500 · acima → R$ 2.000.
                  {calc.vaTouched ? (
                    <button
                      type="button"
                      className="ml-1 text-taking hover:underline"
                      onClick={calc.resetVaRule}
                    >
                      Restaurar regra
                    </button>
                  ) : null}
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Vale refeição</label>
                <input
                  type="number"
                  value={calc.vr}
                  onChange={(e) => calc.setVr(Number(e.target.value) || 0)}
                  className="mono-num w-full rounded-xl border border-border/15 bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-taking/50"
                />
                <p className="mt-1.5 text-[11px] text-muted">Pré-preenchido em R$ 700,00.</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Breakdown de custo"
          subtitle="Composição do custo mensal Taking."
          open={open.breakdown}
          onToggle={() => toggle("breakdown")}
        >
          <div className="overflow-auto rounded-xl border border-border/10">
            <table className="w-full text-xs">
              <tbody>
                {values.breakdown.map((line) => (
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
        </CollapsibleSection>
      </div>

      <aside className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
        <div className="glass overflow-hidden rounded-2xl shadow-glow">
          <div className="border-b border-border/10 bg-taking-muted px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-taking">Preço de venda</p>
            <p className="mono-num mt-1 text-3xl font-bold text-foreground sm:text-4xl">
              {formatBRL(values.saleHourly)}
              <span className="text-lg font-normal text-muted">/h</span>
            </p>
            <p className="mono-num mt-1 text-sm text-muted">{formatBRL(values.saleMonthly)}/mês</p>
          </div>
          <div className="flex flex-col items-center px-5 py-6">
            <MbGauge mb={values.mbPct} />
            <div className="mt-4">
              <ApprovalChip mb={values.mbPct} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-border/10 p-4">
            <MetricTile label="Custo/h" value={formatBRL(values.costHourly)} />
            <MetricTile label="Custo/mês" value={formatBRL(values.costMonthly)} />
            <MetricTile label="Impostos" value={formatBRL(values.taxes)} />
            <MetricTile label="Margem R$" value={formatBRL(values.mbReais)} highlight />
          </div>
          {calc.profile ? (
            <p className="border-t border-border/10 px-4 py-3 text-[11px] text-muted">
              {calc.profile}
              <span className="text-foreground/70"> · {formatPct(values.mbPct)}</span>
            </p>
          ) : (
            <p className="border-t border-border/10 px-4 py-3 text-[11px] text-muted">
              Selecione a competência técnica para preencher automaticamente.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function LockField({
  id,
  label,
  value,
  suffix,
  hint,
  calc,
}: {
  id: ValueKey;
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  calc: ReturnType<typeof useV1Calculator>;
}) {
  return (
    <LockableInput
      label={label}
      suffix={suffix}
      value={value}
      hint={hint}
      locked={calc.locks[id]}
      onToggleLock={() => calc.toggleLock(id)}
      onChange={(v) => calc.editValue(id, v)}
    />
  );
}

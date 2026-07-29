import type {
  Alcada,
  ApprovalLevel,
  ContractModel,
  CostBreakdownLine,
  CostResult,
  FinderOption,
  HealthStatus,
  HoursOption,
  InfraOption,
} from "./types";
import {
  CLT,
  CLT_ADM_RATE,
  FINDER_PCT,
  INFRA_COST,
  PJ_TAX_RATE,
  SGA_RATE,
  TAX_ON_REVENUE,
  TEAMS_COST,
} from "./constants";

export type CalcInput = {
  salary: number;
  model: ContractModel;
  targetMb: number;
  hours: HoursOption;
  infra: InfraOption;
  finder: FinderOption;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function computeCost(input: CalcInput): CostResult {
  const salary = Math.max(0, input.salary || 0);
  const hours = input.hours || 168;
  const targetMb = Math.min(0.5, Math.max(0.15, input.targetMb));
  const infra = INFRA_COST[input.infra];
  const finderPct = FINDER_PCT[input.finder];
  const finder = salary * finderPct;
  const teams = TEAMS_COST;
  const breakdown: CostBreakdownLine[] = [];

  let costMonthly = 0;

  if (input.model === "PJ") {
    const impostoPj = salary * PJ_TAX_RATE;
    const custoLiquido = salary - impostoPj;
    const base = custoLiquido + infra + teams + finder;
    const sga = base * SGA_RATE;
    costMonthly = base + sga;
    breakdown.push(
      { label: "Salário bruto", value: salary },
      { label: "Imposto PJ (15%)", value: -impostoPj },
      { label: "Custo líquido", value: custoLiquido },
      { label: "INFRA", value: infra },
      { label: "Teams/Office", value: teams },
      { label: `Finder (${(finderPct * 100).toFixed(0)}%)`, value: finder },
      { label: "Base", value: base },
      { label: "SGA (9%)", value: sga },
      { label: "Custo mensal", value: costMonthly },
    );
  } else {
    const encargosDiretos = salary * (CLT.inss + CLT.salarioEducacao + CLT.fgts + CLT.rat);
    const ferias = salary * CLT.ferias;
    const decimo = salary * CLT.decimo;
    const fgtsFerias = salary * (CLT.fgts * CLT.ferias);
    const inssFerias = salary * (CLT.inss * CLT.ferias);
    const fgtsDecimo = salary * (CLT.fgts * CLT.decimo);
    const inssDecimo = salary * (CLT.inss * CLT.decimo);
    const aviso = salary * CLT.aviso;
    const multaFgts = salary * (CLT.fgts * CLT.decimo);
    const incidencias = ferias + decimo + fgtsFerias + inssFerias + fgtsDecimo + inssDecimo + aviso + multaFgts;
    const beneficios = CLT.vr + CLT.va + CLT.vt + CLT.seguroVida + CLT.convenio;
    const subtotal = salary + encargosDiretos + incidencias + beneficios;
    const taxaAdm = subtotal * CLT_ADM_RATE;
    const base = subtotal + taxaAdm + infra + teams + finder;
    const sga = base * SGA_RATE;
    costMonthly = base + sga;
    breakdown.push(
      { label: "Salário", value: salary },
      { label: "Encargos diretos (INSS+Sal.Ed+FGTS+RAT)", value: encargosDiretos },
      { label: "Férias + 1/3", value: ferias },
      { label: "13º salário", value: decimo },
      { label: "FGTS s/Férias", value: fgtsFerias },
      { label: "INSS s/Férias", value: inssFerias },
      { label: "FGTS s/13º", value: fgtsDecimo },
      { label: "INSS s/13º", value: inssDecimo },
      { label: "Aviso prévio", value: aviso },
      { label: "Multa FGTS", value: multaFgts },
      { label: "Benefícios (VR+VA+VT+Seguro+Convênio)", value: beneficios },
      { label: "Subtotal", value: subtotal },
      { label: "Taxa ADM (8%)", value: taxaAdm },
      { label: "INFRA", value: infra },
      { label: "Teams/Office", value: teams },
      { label: `Finder (${(finderPct * 100).toFixed(0)}%)`, value: finder },
      { label: "Base", value: base },
      { label: "SGA (9%)", value: sga },
      { label: "Custo mensal", value: costMonthly },
    );
  }

  const denom = 1 - targetMb - TAX_ON_REVENUE;
  const saleMonthly = denom > 0.01 ? costMonthly / denom : 0;
  const taxes = saleMonthly * TAX_ON_REVENUE;
  const marginReais = saleMonthly - costMonthly - taxes;
  const mbReal = saleMonthly > 0 ? marginReais / saleMonthly : 0;

  return {
    salary,
    model: input.model,
    infra,
    teams,
    finder,
    finderPct,
    hours,
    targetMb,
    costMonthly: round2(costMonthly),
    costHourly: round2(costMonthly / hours),
    saleMonthly: round2(saleMonthly),
    saleHourly: round2(saleMonthly / hours),
    taxes: round2(taxes),
    marginReais: round2(marginReais),
    mbReal,
    breakdown: breakdown.map((b) => ({ ...b, value: round2(b.value) })),
  };
}

/** Given desired revenue, compute resulting MB. */
export function mbFromRevenue(costMonthly: number, saleMonthly: number) {
  if (saleMonthly <= 0) return 0;
  const taxes = saleMonthly * TAX_ON_REVENUE;
  return (saleMonthly - costMonthly - taxes) / saleMonthly;
}

/** Given desired MB, compute required sale. */
export function saleFromMb(costMonthly: number, targetMb: number) {
  const denom = 1 - targetMb - TAX_ON_REVENUE;
  return denom > 0.01 ? costMonthly / denom : 0;
}

export function approvalForMb(mb: number): ApprovalLevel {
  const pct = mb * 100;
  if (pct >= 32) return "Automática";
  if (pct >= 29) return "Head de Oferta + Comercial";
  if (pct >= 26) return "CHRO + VP Comercial";
  return "CFO + CEO";
}

export function alcadaForAnnualRevenue(annual: number): Alcada {
  if (annual < 700_000) return "FAST TRACK";
  if (annual <= 3_500_000) return "REGULAR DEAL";
  return "BIG DEAL";
}

export function healthStatus(mb: number): HealthStatus {
  const pct = mb * 100;
  if (pct >= 32) return "SAUDÁVEL";
  if (pct >= 29) return "ATENÇÃO";
  return "CRÍTICO";
}

export function mbTone(mb: number): "green" | "amber" | "red" {
  const pct = mb * 100;
  if (pct >= 32) return "green";
  if (pct >= 29) return "amber";
  return "red";
}

export function operationMargin(costMonthly: number, saleMonthly: number) {
  const taxes = saleMonthly * TAX_ON_REVENUE;
  const marginReais = saleMonthly - costMonthly - taxes;
  const mb = saleMonthly > 0 ? marginReais / saleMonthly : 0;
  return { taxes: round2(taxes), marginReais: round2(marginReais), mb };
}

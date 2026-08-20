import {
  TAX_ON_REVENUE,
  baseSalaryFor,
  computeCost,
  type ContractModel,
  type CostBreakdownLine,
  type InfraOption,
  type Seniority,
} from "@/lib/margin-calculator";
import {
  type BtgSeniority,
  btgMidHourly,
  btgRange,
  type HourRange,
} from "./btg-ratecard";
import { DEFAULT_MB, DEFAULT_VALE_REFEICAO, defaultValeAlimentacao } from "./defaults";

export type RatecardTable = "taking" | "btg";

export type V1Seniority = Seniority | BtgSeniority;

export type ValueKey =
  | "saleHourly"
  | "employeeHourly"
  | "costHourly"
  | "salary"
  | "costMonthly"
  | "mbPct"
  | "mbReais";

export type V1Values = {
  saleHourly: number;
  employeeHourly: number;
  costHourly: number;
  salary: number;
  costMonthly: number;
  mbPct: number;
  mbReais: number;
  saleMonthly: number;
  taxes: number;
  breakdown: CostBreakdownLine[];
};

export type EngineExtras = {
  model: ContractModel;
  hours: number;
  infra: InfraOption;
  va: number;
  vr: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function safeHours(hours: number) {
  return hours > 0 ? hours : 168;
}

export function runCost(salary: number, extras: EngineExtras) {
  return computeCost({
    salary,
    model: extras.model,
    targetMb: DEFAULT_MB,
    hours: extras.hours,
    infra: extras.infra,
    finder: "none",
    va: extras.va,
    vr: extras.vr,
    clampMb: false,
  });
}

export function salaryFromCost(targetCost: number, extras: EngineExtras) {
  const goal = Math.max(0, targetCost);
  let lo = 0;
  let hi = Math.max(8000, goal * 2);
  for (let i = 0; i < 12; i++) {
    if (runCost(hi, extras).costMonthly >= goal) break;
    hi *= 2;
  }
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (runCost(mid, extras).costMonthly < goal) lo = mid;
    else hi = mid;
  }
  return round2((lo + hi) / 2);
}

export function saleFromCostMb(costMonthly: number, mb: number) {
  const denom = 1 - mb - TAX_ON_REVENUE;
  return denom > 0.01 ? costMonthly / denom : 0;
}

export function mbFromCostSale(costMonthly: number, saleMonthly: number) {
  if (saleMonthly <= 0) return 0;
  return (saleMonthly - costMonthly - saleMonthly * TAX_ON_REVENUE) / saleMonthly;
}

export function costFromSaleMb(saleMonthly: number, mb: number) {
  return Math.max(0, saleMonthly * (1 - mb - TAX_ON_REVENUE));
}

export function packValues(
  salary: number,
  costMonthly: number,
  saleMonthly: number,
  extras: EngineExtras,
  breakdown: CostBreakdownLine[],
): V1Values {
  const hours = safeHours(extras.hours);
  const taxes = saleMonthly * TAX_ON_REVENUE;
  const mbReais = saleMonthly - costMonthly - taxes;
  const mbPct = saleMonthly > 0 ? mbReais / saleMonthly : 0;
  return {
    salary: round2(salary),
    costMonthly: round2(costMonthly),
    saleMonthly: round2(saleMonthly),
    saleHourly: round2(saleMonthly / hours),
    employeeHourly: round2(salary / hours),
    costHourly: round2(costMonthly / hours),
    mbPct,
    mbReais: round2(mbReais),
    taxes: round2(taxes),
    breakdown,
  };
}

export function valuesFromSalary(salary: number, mb: number, extras: EngineExtras): V1Values {
  const cost = runCost(salary, extras);
  const saleMonthly = saleFromCostMb(cost.costMonthly, mb);
  return packValues(salary, cost.costMonthly, saleMonthly, extras, cost.breakdown);
}

export function valuesFromSaleAndMb(saleMonthly: number, mb: number, extras: EngineExtras): V1Values {
  const costMonthly = costFromSaleMb(saleMonthly, mb);
  const salary = salaryFromCost(costMonthly, extras);
  const cost = runCost(salary, extras);
  return packValues(salary, cost.costMonthly, saleMonthly, extras, cost.breakdown);
}

export function valuesFromSaleAndCost(saleMonthly: number, costMonthly: number, extras: EngineExtras): V1Values {
  const salary = salaryFromCost(costMonthly, extras);
  const cost = runCost(salary, extras);
  return packValues(salary, cost.costMonthly, saleMonthly, extras, cost.breakdown);
}

export function takingBaseSalary(profile: string, seniority: Seniority, model: ContractModel) {
  if (!profile) return 0;
  return baseSalaryFor(profile, seniority, model);
}

export function btgSaleHint(profile: string, seniority: BtgSeniority): HourRange | undefined {
  if (!profile) return undefined;
  return btgRange(profile, seniority);
}

export function seedFromRatecard(input: {
  table: RatecardTable;
  profile: string;
  takingSeniority: Seniority;
  btgSeniority: BtgSeniority;
  model: ContractModel;
  extras: EngineExtras;
  mb: number;
}): V1Values {
  const { table, profile, extras, mb } = input;
  if (!profile) return valuesFromSalary(0, mb, extras);

  if (table === "taking") {
    const salary = takingBaseSalary(profile, input.takingSeniority, input.model);
    return valuesFromSalary(salary, mb, extras);
  }

  const saleHourly = btgMidHourly(profile, input.btgSeniority);
  const saleMonthly = saleHourly * safeHours(extras.hours);
  return valuesFromSaleAndMb(saleMonthly, mb, extras);
}

export function applyVaForSalary(salary: number, vaTouched: boolean, currentVa: number) {
  if (vaTouched) return currentVa;
  return defaultValeAlimentacao(salary);
}

export { DEFAULT_MB, DEFAULT_VALE_REFEICAO, defaultValeAlimentacao };

import { useMemo, useState } from "react";
import { PROFILE_NAMES, TAX_ON_REVENUE, type ContractModel, type InfraOption, type Seniority } from "@/lib/margin-calculator";
import { BTG_PROFILE_NAMES, type BtgSeniority } from "@/lib/v1/btg-ratecard";
import { DEFAULT_HOURS, DEFAULT_MB, DEFAULT_VALE_REFEICAO, defaultValeAlimentacao } from "@/lib/v1/defaults";
import {
  applyVaForSalary,
  btgSaleHint,
  type RatecardTable,
  runCost,
  saleFromCostMb,
  seedFromRatecard,
  type ValueKey,
  type V1Values,
  valuesFromSalary,
  valuesFromSaleAndCost,
  valuesFromSaleAndMb,
} from "@/lib/v1/solver";

const EMPTY_LOCKS: Record<ValueKey, boolean> = {
  saleHourly: false,
  employeeHourly: false,
  costHourly: false,
  salary: false,
  costMonthly: false,
  mbPct: false,
  mbReais: false,
};

export function useV1Calculator() {
  const [table, setTableState] = useState<RatecardTable>("taking");
  const [profile, setProfileState] = useState("");
  const [takingSeniority, setTakingSeniority] = useState<Seniority>("Pl");
  const [btgSeniority, setBtgSeniority] = useState<BtgSeniority>("PLENO");
  const [model, setModelState] = useState<ContractModel>("CLT_FULL");
  const [hours, setHoursState] = useState(DEFAULT_HOURS);
  const [infra, setInfraState] = useState<InfraOption>("notebook");
  const [va, setVaState] = useState(500);
  const [vr, setVrState] = useState(DEFAULT_VALE_REFEICAO);
  const [vaTouched, setVaTouched] = useState(false);
  const [locks, setLocks] = useState(EMPTY_LOCKS);
  const [values, setValues] = useState<V1Values>(() => emptySeed());

  const extras = useMemo(
    () => ({ model, hours, infra, va, vr }),
    [model, hours, infra, va, vr],
  );

  const profiles = table === "taking" ? PROFILE_NAMES : BTG_PROFILE_NAMES;
  const btgHint = table === "btg" ? btgSaleHint(profile, btgSeniority) : undefined;
  const seniority = table === "taking" ? takingSeniority : btgSeniority;

  const hold = {
    salary: locks.salary || locks.employeeHourly,
    cost: locks.costMonthly || locks.costHourly,
    sale: locks.saleHourly,
    mb: locks.mbPct,
  };

  function withVa(salary: number, base = extras) {
    return { ...base, va: applyVaForSalary(salary, vaTouched, base.va) };
  }

  function push(next: V1Values, nextVa?: number) {
    if (nextVa != null && Math.abs(nextVa - va) > 0.009) setVaState(nextVa);
    setValues(next);
  }

  function applySalary(salary: number, mb: number, base = extras) {
    const ex = withVa(salary, base);
    push(valuesFromSalary(salary, mb, ex), ex.va);
  }

  function applySaleMb(saleMonthly: number, mb: number, base = extras) {
    const probe = valuesFromSaleAndMb(saleMonthly, mb, base);
    const ex = withVa(probe.salary, base);
    push(valuesFromSaleAndMb(saleMonthly, mb, ex), ex.va);
  }

  function currentMb() {
    if (hold.mb) return values.mbPct || DEFAULT_MB;
    return values.saleMonthly > 0 ? values.mbPct || DEFAULT_MB : DEFAULT_MB;
  }

  function seed(partial: {
    table?: RatecardTable;
    profile?: string;
    takingSeniority?: Seniority;
    btgSeniority?: BtgSeniority;
    model?: ContractModel;
    hours?: number;
    extras?: typeof extras;
  }) {
    const t = partial.table ?? table;
    const p = partial.profile ?? profile;
    const ts = partial.takingSeniority ?? takingSeniority;
    const bs = partial.btgSeniority ?? btgSeniority;
    const m = partial.model ?? model;
    const h = partial.hours ?? hours;
    const base = { ...(partial.extras ?? extras), model: m, hours: h };
    const mb = currentMb();

    const seeded = seedFromRatecard({
      table: t,
      profile: p,
      takingSeniority: ts,
      btgSeniority: bs,
      model: m,
      extras: base,
      mb,
    });

    if (hold.sale && hold.mb) {
      applySaleMb(values.saleMonthly, mb, base);
      return;
    }
    if (hold.sale) {
      const salary = hold.salary ? values.salary : seeded.salary;
      const ex = withVa(salary, base);
      const cost = runCost(salary, ex);
      push(valuesFromSaleAndCost(values.saleMonthly, cost.costMonthly, ex), ex.va);
      return;
    }
    if (hold.salary) {
      applySalary(values.salary, mb, base);
      return;
    }
    if (t === "btg" && p) {
      applySaleMb(seeded.saleMonthly, mb, base);
      return;
    }
    applySalary(seeded.salary, mb, base);
  }

  function setTable(next: RatecardTable) {
    setTableState(next);
    setProfileState("");
    seed({ table: next, profile: "" });
  }

  function setProfile(next: string) {
    setProfileState(next);
    seed({ profile: next });
  }

  function setSeniority(next: Seniority | BtgSeniority) {
    if (table === "taking") {
      setTakingSeniority(next as Seniority);
      seed({ takingSeniority: next as Seniority });
    } else {
      setBtgSeniority(next as BtgSeniority);
      seed({ btgSeniority: next as BtgSeniority });
    }
  }

  function setModel(next: ContractModel) {
    setModelState(next);
    seed({ model: next, extras: { ...extras, model: next } });
  }

  function setHours(next: number) {
    const h = Math.max(1, Number(next) || DEFAULT_HOURS);
    setHoursState(h);
    const base = { ...extras, hours: h };
    if (hold.sale) {
      applySaleMb(values.saleHourly * h, currentMb(), base);
      return;
    }
    seed({ hours: h, extras: base });
  }

  function applyExtras(base: typeof extras) {
    if (hold.cost) {
      const saleMonthly = hold.sale
        ? values.saleMonthly
        : saleFromCostMb(values.costMonthly, currentMb());
      push(valuesFromSaleAndCost(saleMonthly, values.costMonthly, base));
      return;
    }
    if (hold.sale && hold.mb) {
      applySaleMb(values.saleMonthly, currentMb(), base);
      return;
    }
    if (hold.sale) {
      const ex = withVa(values.salary, base);
      const cost = runCost(values.salary, ex);
      push(valuesFromSaleAndCost(values.saleMonthly, cost.costMonthly, ex), ex.va);
      return;
    }
    applySalary(values.salary, currentMb(), base);
  }

  function setInfra(next: InfraOption) {
    setInfraState(next);
    applyExtras({ ...extras, infra: next });
  }

  function setVa(next: number) {
    setVaTouched(true);
    setVaState(next);
    applyExtras({ ...extras, va: next });
  }

  function setVr(next: number) {
    setVrState(next);
    applyExtras({ ...extras, vr: next });
  }

  function resetVaRule() {
    setVaTouched(false);
    const nextVa = defaultValeAlimentacao(values.salary);
    setVaState(nextVa);
    applySalary(values.salary, currentMb(), { ...extras, va: nextVa });
  }

  function toggleLock(key: ValueKey) {
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function editValue(key: ValueKey, raw: number) {
    const n = Number.isFinite(raw) ? raw : 0;
    const h = hours > 0 ? hours : DEFAULT_HOURS;

    if (key === "salary" || key === "employeeHourly") {
      const salary = key === "salary" ? n : n * h;
      if (hold.sale && !hold.mb) {
        const ex = withVa(salary);
        const cost = runCost(salary, ex);
        push(valuesFromSaleAndCost(values.saleMonthly, cost.costMonthly, ex), ex.va);
        return;
      }
      if (hold.sale && hold.mb) {
        applySaleMb(values.saleMonthly, currentMb());
        return;
      }
      applySalary(salary, currentMb());
      return;
    }

    if (key === "costMonthly" || key === "costHourly") {
      const costMonthly = key === "costMonthly" ? n : n * h;
      if (hold.sale) {
        push(valuesFromSaleAndCost(values.saleMonthly, costMonthly, extras));
        return;
      }
      const mb = currentMb();
      const saleMonthly = saleFromCostMb(costMonthly, mb);
      push(valuesFromSaleAndCost(saleMonthly, costMonthly, extras));
      return;
    }

    if (key === "saleHourly") {
      const saleMonthly = n * h;
      if (hold.mb) {
        applySaleMb(saleMonthly, currentMb());
        return;
      }
      const ex = withVa(values.salary);
      const cost = runCost(values.salary, ex);
      push(valuesFromSaleAndCost(saleMonthly, cost.costMonthly, ex), ex.va);
      return;
    }

    if (key === "mbPct") {
      const mb = n > 1.5 ? n / 100 : n;
      if (hold.sale) {
        applySaleMb(values.saleMonthly, mb);
        return;
      }
      applySalary(values.salary, mb);
      return;
    }

    if (key === "mbReais") {
      if (hold.sale) {
        const cost = Math.max(0, values.saleMonthly * (1 - TAX_ON_REVENUE) - n);
        push(valuesFromSaleAndCost(values.saleMonthly, cost, extras));
        return;
      }
      const ex = withVa(values.salary);
      const cost = runCost(values.salary, ex);
      const sale = (n + cost.costMonthly) / (1 - TAX_ON_REVENUE);
      push(valuesFromSaleAndCost(sale, cost.costMonthly, ex), ex.va);
    }
  }

  return {
    table,
    profile,
    seniority,
    takingSeniority,
    btgSeniority,
    model,
    hours,
    infra,
    va,
    vr,
    vaTouched,
    values,
    locks,
    profiles,
    btgHint,
    setTable,
    setProfile,
    setSeniority,
    setModel,
    setHours,
    setInfra,
    setVa,
    setVr,
    resetVaRule,
    toggleLock,
    editValue,
  };
}

function emptySeed() {
  return seedFromRatecard({
    table: "taking",
    profile: "",
    takingSeniority: "Pl",
    btgSeniority: "PLENO",
    model: "CLT_FULL",
    extras: {
      model: "CLT_FULL",
      hours: DEFAULT_HOURS,
      infra: "notebook",
      va: 500,
      vr: DEFAULT_VALE_REFEICAO,
    },
    mb: DEFAULT_MB,
  });
}

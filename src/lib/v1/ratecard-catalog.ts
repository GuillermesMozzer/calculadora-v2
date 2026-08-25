import { PROFILE_NAMES, baseSalaryFor, type ContractModel } from "@/lib/margin-calculator";
import { BTG_PROFILES, BTG_SOURCE_VERSION } from "./btg-ratecard";
import {
  type RateCell,
  type V1Seniority,
  cellValue,
  emptyRates,
} from "./seniority";

export type RatecardKind = "salary" | "hourly";

export type RatecardRow = {
  profile: string;
  rates: Record<V1Seniority, RateCell>;
};

export type RatecardDef = {
  id: string;
  name: string;
  builtin: boolean;
  kind: RatecardKind;
  rows: RatecardRow[];
  sourceVersion?: string;
};

const STORAGE_KEY = "calculadora_v1_ratecards";

type Stored = {
  overrides: Record<string, RatecardDef>;
  custom: RatecardDef[];
};

function avg(a: number, b: number) {
  return Math.round((a + b) / 2);
}

function salaryCell(n: number): RateCell {
  if (!n) return null;
  return { min: n, max: n };
}

export function takingSalaryFor(profile: string, seniority: V1Seniority, model: ContractModel) {
  const jr = baseSalaryFor(profile, "Jr", model);
  const pl = baseSalaryFor(profile, "Pl", model);
  const sr = baseSalaryFor(profile, "Sr", model);
  const esp = baseSalaryFor(profile, "Esp", model);
  switch (seniority) {
    case "JUNIOR":
      return jr;
    case "JUNIOR_II":
      return avg(jr, pl);
    case "PLENO":
      return pl;
    case "PLENO_II":
      return avg(pl, sr);
    case "SENIOR":
      return sr;
    case "SENIOR_II":
      return avg(sr, esp);
    case "ESPECIALISTA":
      return esp;
  }
}

function builtinTaking(): RatecardDef {
  const rows: RatecardRow[] = PROFILE_NAMES.map((profile) => ({
    profile,
    rates: {
      JUNIOR: salaryCell(takingSalaryFor(profile, "JUNIOR", "CLT_FULL")),
      JUNIOR_II: salaryCell(takingSalaryFor(profile, "JUNIOR_II", "CLT_FULL")),
      PLENO: salaryCell(takingSalaryFor(profile, "PLENO", "CLT_FULL")),
      PLENO_II: salaryCell(takingSalaryFor(profile, "PLENO_II", "CLT_FULL")),
      SENIOR: salaryCell(takingSalaryFor(profile, "SENIOR", "CLT_FULL")),
      SENIOR_II: salaryCell(takingSalaryFor(profile, "SENIOR_II", "CLT_FULL")),
      ESPECIALISTA: salaryCell(takingSalaryFor(profile, "ESPECIALISTA", "CLT_FULL")),
    },
  }));
  return { id: "taking", name: "Ratecard Taking", builtin: true, kind: "salary", rows };
}

function builtinBtg(): RatecardDef {
  const rows: RatecardRow[] = BTG_PROFILES.map((p) => ({
    profile: p.profile,
    rates: { ...emptyRates(), ...p.rates },
  }));
  return {
    id: "btg",
    name: "Ratecard BTG",
    builtin: true,
    kind: "hourly",
    sourceVersion: BTG_SOURCE_VERSION,
    rows,
  };
}

function readStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { overrides: {}, custom: [] };
    const parsed = JSON.parse(raw) as Stored;
    return {
      overrides: parsed.overrides ?? {},
      custom: parsed.custom ?? [],
    };
  } catch {
    return { overrides: {}, custom: [] };
  }
}

function writeStored(stored: Stored) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function cloneRatecard(table: RatecardDef): RatecardDef {
  return {
    ...table,
    rows: table.rows.map((row) => ({
      profile: row.profile,
      rates: { ...row.rates },
    })),
  };
}

export function listRatecards(): RatecardDef[] {
  const stored = readStored();
  const taking = stored.overrides.taking ?? builtinTaking();
  const btgOverride = stored.overrides.btg;
  const btg =
    btgOverride?.sourceVersion === BTG_SOURCE_VERSION ? btgOverride : builtinBtg();
  const custom = [...stored.custom].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return [taking, btg, ...custom];
}

export function getRatecard(id: string): RatecardDef | undefined {
  return listRatecards().find((t) => t.id === id);
}

export function sortRows(rows: RatecardRow[]) {
  return [...rows].sort((a, b) => a.profile.localeCompare(b.profile, "pt-BR"));
}

export function saveRatecard(table: RatecardDef) {
  const stored = readStored();
  const next = { ...cloneRatecard(table), rows: sortRows(table.rows) };
  if (next.id === "taking" || next.id === "btg") {
    stored.overrides[next.id] = { ...next, builtin: true };
  } else {
    const idx = stored.custom.findIndex((t) => t.id === next.id);
    if (idx >= 0) stored.custom[idx] = { ...next, builtin: false };
    else stored.custom.push({ ...next, builtin: false });
    stored.custom.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }
  writeStored(stored);
  return getRatecard(next.id)!;
}

export function createRatecard(name: string, source?: RatecardDef): RatecardDef {
  const trimmed = name.trim();
  const id = `custom_${Date.now()}`;
  const table: RatecardDef = source
    ? {
        ...cloneRatecard(source),
        id,
        name: trimmed,
        builtin: false,
      }
    : {
        id,
        name: trimmed,
        builtin: false,
        kind: "hourly",
        rows: [{ profile: "", rates: emptyRates() }],
      };
  saveRatecard(table);
  return getRatecard(id)!;
}

export function lookupRate(table: RatecardDef, profile: string, seniority: V1Seniority, model: ContractModel) {
  if (!profile) return { salary: 0, saleHourly: 0, range: null as RateCell };

  if (table.id === "taking" && !readStored().overrides.taking) {
    const salary = takingSalaryFor(profile, seniority, model);
    return { salary, saleHourly: 0, range: salaryCell(salary) };
  }

  const row = table.rows.find((r) => r.profile === profile);
  const cell = row?.rates[seniority] ?? null;
  if (!cell) return { salary: 0, saleHourly: 0, range: null };

  if (table.kind === "hourly") {
    return { salary: 0, saleHourly: cellValue(cell), range: cell };
  }
  return { salary: cellValue(cell), saleHourly: 0, range: cell };
}

export function blankRow(): RatecardRow {
  return { profile: "", rates: emptyRates() };
}

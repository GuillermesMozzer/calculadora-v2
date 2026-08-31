import type { ContractModel } from "@/lib/margin-calculator";
import { BTG_PROFILES, BTG_SOURCE_VERSION } from "./btg-ratecard";
import { TAKING_PROFILES, TAKING_SOURCE_VERSION } from "./taking-ratecard";
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

function builtinTaking(): RatecardDef {
  const rows: RatecardRow[] = TAKING_PROFILES.map((p) => ({
    profile: p.profile,
    rates: { ...emptyRates(), ...p.rates },
  }));
  return {
    id: "taking",
    name: "Ratecard Taking",
    builtin: true,
    kind: "hourly",
    sourceVersion: TAKING_SOURCE_VERSION,
    rows,
  };
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
  const takingOverride = stored.overrides.taking;
  const taking =
    takingOverride?.sourceVersion === TAKING_SOURCE_VERSION ? takingOverride : builtinTaking();
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
    stored.overrides[next.id] = {
      ...next,
      builtin: true,
      sourceVersion: next.id === "taking" ? TAKING_SOURCE_VERSION : BTG_SOURCE_VERSION,
    };
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
  void model;
  if (!profile) return { salary: 0, saleHourly: 0, range: null as RateCell };

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

import type { FinderOption, InfraOption, Seniority } from "./types";

export const TAX_ON_REVENUE = 0.0655;
export const SGA_RATE = 0.09;
export const TEAMS_COST = 85;
export const PJ_TAX_RATE = 0.15;
export const CLT_ADM_RATE = 0.08;

export const CLT = {
  inss: 0.2,
  salarioEducacao: 0.058,
  fgts: 0.08,
  rat: 0.01,
  ferias: 0.1111,
  decimo: 0.0833,
  aviso: 0.0833,
  vr: 710,
  va: 50,
  vt: 213.6,
  seguroVida: 8,
  convenio: 450,
} as const;

export const INFRA_COST: Record<InfraOption, number> = {
  notebook: 400,
  macbook: 1700,
  none: 0,
};

export const FINDER_PCT: Record<FinderOption, number> = {
  none: 0,
  interno: 0.03,
  externo: 0.03,
  ambos: 0.06,
};

export const SENIORITY_LABEL: Record<Seniority, string> = {
  Jr: "Júnior",
  Pl: "Pleno",
  Sr: "Sênior",
  Esp: "Especialista",
};

export const MODEL_LABEL: Record<"PJ" | "CLT_FULL" | "CLT_ESTRATEGICO", string> = {
  PJ: "PJ",
  CLT_FULL: "CLT Full",
  CLT_ESTRATEGICO: "CLT Estratégico",
};

export const CALC_ORANGE = "#F15A24";
export const CALC_ORANGE_HOVER = "#d94e1a";

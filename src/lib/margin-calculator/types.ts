export type Seniority = "Jr" | "Pl" | "Sr" | "Esp";

export type ContractModel = "PJ" | "CLT_FULL" | "CLT_ESTRATEGICO";

export type HoursOption = 80 | 168 | 176 | 220;

export type InfraOption = "notebook" | "macbook" | "none";

export type FinderOption = "none" | "interno" | "externo" | "ambos";

export type SalaryRow = {
  profile: string;
  seniority: Seniority;
  pj: number;
  clt: number;
  cltDa: number;
};

export type CostBreakdownLine = { label: string; value: number };

export type CostResult = {
  salary: number;
  model: ContractModel;
  infra: number;
  teams: number;
  finder: number;
  finderPct: number;
  hours: number;
  targetMb: number;
  costMonthly: number;
  costHourly: number;
  saleMonthly: number;
  saleHourly: number;
  taxes: number;
  marginReais: number;
  mbReal: number;
  breakdown: CostBreakdownLine[];
};

export type ApprovalLevel =
  | "Automática"
  | "Head de Oferta + Comercial"
  | "CHRO + VP Comercial"
  | "CFO + CEO";

export type Alcada = "FAST TRACK" | "REGULAR DEAL" | "BIG DEAL";

export type HealthStatus = "SAUDÁVEL" | "ATENÇÃO" | "CRÍTICO";

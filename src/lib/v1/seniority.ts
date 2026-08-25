export type V1Seniority =
  | "JUNIOR"
  | "JUNIOR_II"
  | "PLENO"
  | "PLENO_II"
  | "SENIOR"
  | "SENIOR_II"
  | "ESPECIALISTA";

export const V1_SENIORITIES: { id: V1Seniority; label: string; short: string }[] = [
  { id: "JUNIOR", label: "Júnior", short: "Jr" },
  { id: "JUNIOR_II", label: "Júnior II", short: "Jr II" },
  { id: "PLENO", label: "Pleno", short: "Pl" },
  { id: "PLENO_II", label: "Pleno II", short: "Pl II" },
  { id: "SENIOR", label: "Sênior", short: "Sr" },
  { id: "SENIOR_II", label: "Sênior II", short: "Sr II" },
  { id: "ESPECIALISTA", label: "Especialista / Arquiteto", short: "Esp" },
];

export const V1_SENIORITY_IDS: V1Seniority[] = V1_SENIORITIES.map((s) => s.id);

export function emptyRates(): Record<V1Seniority, RateCell> {
  return {
    JUNIOR: null,
    JUNIOR_II: null,
    PLENO: null,
    PLENO_II: null,
    SENIOR: null,
    SENIOR_II: null,
    ESPECIALISTA: null,
  };
}

export type RateCell = { min: number; max: number } | null;

export function cellValue(cell: RateCell): number {
  if (!cell) return 0;
  return (cell.min + cell.max) / 2;
}

export function formatCell(cell: RateCell): string {
  if (!cell) return "";
  if (Math.abs(cell.min - cell.max) < 0.005) return String(cell.min);
  return `${cell.min} - ${cell.max}`;
}

export function parseCell(raw: string): RateCell {
  const text = raw.replace(/R\$/gi, "").replace(/\s/g, "").replace(",", ".");
  if (!text) return null;
  const range = text.split(/[-–—]/);
  if (range.length >= 2) {
    const min = Number(range[0]);
    const max = Number(range[1]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max };
  }
  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  return { min: n, max: n };
}

export function isCellFilled(cell: RateCell): boolean {
  return cell != null && Number.isFinite(cell.min) && Number.isFinite(cell.max);
}

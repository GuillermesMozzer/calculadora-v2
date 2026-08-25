import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { RatecardDef, RatecardRow } from "./ratecard-catalog";
import {
  formatCell,
  parseCell,
  type V1Seniority,
  V1_SENIORITIES,
  V1_SENIORITY_IDS,
  emptyRates,
} from "./seniority";

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const HEADER_MAP: Record<string, V1Seniority | "profile"> = {
  perfil: "profile",
  perfis: "profile",
  competencia: "profile",
  "competencia tecnica": "profile",
  junior: "JUNIOR",
  jr: "JUNIOR",
  "junior ii": "JUNIOR_II",
  "junior 2": "JUNIOR_II",
  "jr ii": "JUNIOR_II",
  pleno: "PLENO",
  pl: "PLENO",
  "pleno ii": "PLENO_II",
  "pleno 2": "PLENO_II",
  "pl ii": "PLENO_II",
  senior: "SENIOR",
  sr: "SENIOR",
  "senior ii": "SENIOR_II",
  "senior 2": "SENIOR_II",
  "sr ii": "SENIOR_II",
  especialista: "ESPECIALISTA",
  "especialista arquiteto": "ESPECIALISTA",
  arquiteto: "ESPECIALISTA",
};

function mapHeader(raw: string): V1Seniority | "profile" | null {
  const key = normalizeHeader(raw);
  if (HEADER_MAP[key]) return HEADER_MAP[key];
  if (key.includes("perfil") || key.includes("competenc")) return "profile";
  if (key.includes("especial") || key.includes("arquitet")) return "ESPECIALISTA";
  if (key.includes("junior") && key.includes("ii")) return "JUNIOR_II";
  if (key.includes("pleno") && key.includes("ii")) return "PLENO_II";
  if (key.includes("senior") && key.includes("ii")) return "SENIOR_II";
  if (key === "junior" || key.startsWith("junior ")) return "JUNIOR";
  if (key === "pleno" || key.startsWith("pleno ")) return "PLENO";
  if (key === "senior" || key.startsWith("senior ")) return "SENIOR";
  return null;
}

function matrixFromCsv(text: string): string[][] {
  const semi = (text.match(/;/g) || []).length;
  const comma = (text.match(/,/g) || []).length;
  const delim = semi > comma ? ";" : ",";
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.split(delim).map((c) => c.replace(/^"|"$/g, "").trim()))
    .filter((row) => row.some((c) => c));
}

function matrixFromXlsx(buffer: ArrayBuffer): string[][] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  return data.map((row) => row.map((c) => String(c ?? "").trim()));
}

export function parseRatecardMatrix(matrix: string[][]): RatecardRow[] {
  if (matrix.length < 2) return [];
  const header = matrix[0].map(mapHeader);
  const profileIdx = header.findIndex((h) => h === "profile");
  const nameIdx = profileIdx >= 0 ? profileIdx : 0;

  const rows: RatecardRow[] = [];
  for (const line of matrix.slice(1)) {
    const profile = (line[nameIdx] ?? "").trim();
    if (!profile && line.every((c) => !c)) continue;
    const rates = emptyRates();
    header.forEach((col, i) => {
      if (!col || col === "profile") return;
      rates[col] = parseCell(line[i] ?? "");
    });
    rows.push({ profile, rates });
  }
  return rows;
}

export async function parseRatecardFile(file: File): Promise<RatecardRow[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type.includes("csv") || file.type === "text/plain") {
    return parseRatecardMatrix(matrixFromCsv(await file.text()));
  }
  const buf = await file.arrayBuffer();
  return parseRatecardMatrix(matrixFromXlsx(buf));
}

function tableMatrix(table: RatecardDef): string[][] {
  const header = ["Competência técnica", ...V1_SENIORITIES.map((s) => s.label)];
  const body = table.rows.map((row) => [
    row.profile,
    ...V1_SENIORITY_IDS.map((id) => formatCell(row.rates[id])),
  ]);
  return [header, ...body];
}

export function exportRatecardCsv(table: RatecardDef) {
  const matrix = tableMatrix(table);
  const csv = matrix
    .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  downloadBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), `${slug(table.name)}.csv`);
}

export function exportRatecardXlsx(table: RatecardDef) {
  const ws = XLSX.utils.aoa_to_sheet(tableMatrix(table));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ratecard");
  XLSX.writeFile(wb, `${slug(table.name)}.xlsx`);
}

export function exportRatecardPdf(table: RatecardDef) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text(table.name, 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    table.kind === "hourly" ? "Valores em R$/hora" : "Valores em R$ (salário)",
    14,
    20,
  );
  autoTable(doc, {
    startY: 24,
    head: [tableMatrix(table)[0]],
    body: tableMatrix(table).slice(1),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [255, 90, 31], textColor: 255 },
    alternateRowStyles: { fillColor: [250, 246, 243] },
  });
  doc.save(`${slug(table.name)}.pdf`);
}

function slug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "ratecard";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

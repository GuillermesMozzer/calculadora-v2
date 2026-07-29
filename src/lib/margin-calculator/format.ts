export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export function formatPct(ratio: number, digits = 1) {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatDelta(salary: number, base: number) {
  const diff = salary - base;
  if (Math.abs(diff) < 0.5) return { kind: "eq" as const, text: "= Base" };
  const pct = base > 0 ? (Math.abs(diff) / base) * 100 : 0;
  if (diff < 0) {
    return {
      kind: "below" as const,
      text: `▼ ${formatBRL(Math.abs(diff))} (${pct.toFixed(1)}% abaixo — +margem)`,
    };
  }
  return {
    kind: "above" as const,
    text: `▲ ${formatBRL(diff)} (${pct.toFixed(1)}% acima — -margem)`,
  };
}

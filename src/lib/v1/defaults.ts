/** Vale alimentação default por faixa de salário apresentado. */
export function defaultValeAlimentacao(salary: number) {
  if (salary <= 5000) return 500;
  if (salary <= 10000) return 1000;
  if (salary <= 15000) return 1500;
  return 2000;
}

export const DEFAULT_VALE_REFEICAO = 700;
export const DEFAULT_HOURS = 168;
export const DEFAULT_MB = 0.32;

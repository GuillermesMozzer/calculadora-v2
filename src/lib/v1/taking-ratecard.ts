import type { V1Seniority } from "./seniority";

export type TakingSeniority = V1Seniority;

type RangeTuple = [number, number];
type Row = [string, RangeTuple, RangeTuple, RangeTuple, RangeTuple, RangeTuple, RangeTuple, RangeTuple];

const KEYS: TakingSeniority[] = [
  "JUNIOR",
  "JUNIOR_II",
  "PLENO",
  "PLENO_II",
  "SENIOR",
  "SENIOR_II",
  "ESPECIALISTA",
];

export type TakingProfile = {
  profile: string;
  rates: Record<TakingSeniority, { min: number; max: number }>;
};

function row([profile, ...ranges]: Row): TakingProfile {
  const rates = {} as Record<TakingSeniority, { min: number; max: number }>;
  KEYS.forEach((key, i) => {
    const [min, max] = ranges[i];
    rates[key] = { min, max };
  });
  return { profile, rates };
}

/** Ratecard Taking CLT — fonte: ratecard_grupo_taking_2026 (R$/hora, base 168h). */
export const TAKING_SOURCE_VERSION = "ratecard_grupo_taking_2026_taking";

const TAKING_ROWS: Row[] = [
  ["Administrador de Bancos de Dados", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Agile Coach", [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210], [215, 225]],
  ["Analista de Infraestrutura", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Analista de Negócio Calypso", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Analista de Negócio Salesforce", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Analista de Negócio SAP", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["Analista de Processos", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Analista de Redes", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Analista de Requisitos / Negócios", [80, 90], [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180]],
  ["Analista de Segurança da Informação", [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210], [215, 225]],
  ["Analista de Suporte Field Service", [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185]],
  ["Cientista de Dados", [145, 155], [160, 170], [175, 185], [190, 200], [205, 215], [220, 230], [235, 245]],
  ["Consultor SR", [80, 90], [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180]],
  ["Desenvolvedor .ESG / GIS", [115, 125], [145, 155], [165, 175], [185, 195], [205, 215], [225, 235], [275, 285]],
  ["Desenvolvedor .NET", [80, 90], [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180]],
  ["Desenvolvedor Angular", [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185]],
  ["Desenvolvedor Backend Mobile", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Calypso", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Excell", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Frontend Mobile", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Fullstack", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Desenvolvedor Java", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Node", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Desenvolvedor Node JS", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Desenvolvedor PHP", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Python", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Desenvolvedor React", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor RPA", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Salesforce", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["Desenvolvedor SAP", [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220], [225, 235]],
  ["Designer UI", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Designer UX", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["DevOps", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["DevSecOps", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["Engenheiro de Dados", [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220], [225, 235]],
  ["Gerente de Projetos", [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210]],
  ["Gerente PMO", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Product Manager", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["Product Owner", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["QA Automação", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["QA Manual", [70, 80], [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170]],
  ["Scrum Master", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Tech Leader", [145, 155], [160, 170], [175, 185], [190, 200], [205, 215], [220, 230], [235, 245]],
  ["Técnico de Sistema", [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185]],
];

export const TAKING_PROFILES: TakingProfile[] = TAKING_ROWS.map(row).sort((a, b) =>
  a.profile.localeCompare(b.profile, "pt-BR"),
);

export const TAKING_PROFILE_NAMES = TAKING_PROFILES.map((p) => p.profile);

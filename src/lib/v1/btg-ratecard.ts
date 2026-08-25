export type BtgSeniority =
  | "JUNIOR"
  | "JUNIOR_II"
  | "PLENO"
  | "PLENO_II"
  | "SENIOR"
  | "SENIOR_II"
  | "ESPECIALISTA";

export const BTG_SENIORITIES: { id: BtgSeniority; label: string }[] = [
  { id: "JUNIOR", label: "Júnior" },
  { id: "JUNIOR_II", label: "Júnior II" },
  { id: "PLENO", label: "Pleno" },
  { id: "PLENO_II", label: "Pleno II" },
  { id: "SENIOR", label: "Sênior" },
  { id: "SENIOR_II", label: "Sênior II" },
  { id: "ESPECIALISTA", label: "Especialista / Arquiteto" },
];

export type HourRange = { min: number; max: number };

export type BtgProfile = {
  profile: string;
  rates: Record<BtgSeniority, HourRange>;
};

type RangeTuple = [number, number];
type Row = [string, RangeTuple, RangeTuple, RangeTuple, RangeTuple, RangeTuple, RangeTuple, RangeTuple];

const KEYS: BtgSeniority[] = [
  "JUNIOR",
  "JUNIOR_II",
  "PLENO",
  "PLENO_II",
  "SENIOR",
  "SENIOR_II",
  "ESPECIALISTA",
];

function row([profile, ...ranges]: Row): BtgProfile {
  const rates = {} as Record<BtgSeniority, HourRange>;
  KEYS.forEach((key, i) => {
    const [min, max] = ranges[i];
    rates[key] = { min, max };
  });
  return { profile, rates };
}

/** Ratecard BTG CLT — fonte: ratecard_grupo_taking_2026 (R$/hora, base 168h). */
export const BTG_SOURCE_VERSION = "ratecard_grupo_taking_2026_full";

const BTG_ROWS: Row[] = [
  ["Administrador de Bancos de Dados", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Agile Coach", [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220], [225, 235]],
  ["Analista de BI / Power BI", [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185]],
  ["Analista de Dados", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Analista de Governança de Dados", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Analista de Infraestrutura", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Analista de Machine Learning", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["Analista de Negócio Calypso", [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210]],
  ["Analista de Negócio Salesforce", [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210]],
  ["Analista de Negócio SAP", [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215], [220, 230]],
  ["Analista de Observabilidade", [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Analista de Processos", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Analista de Redes", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Analista de Requisitos / Negócios", [80, 90], [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180]],
  ["Analista de Segurança Cloud", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Analista de Segurança da Informação", [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220], [225, 235]],
  ["Analista de Suporte Field Service", [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185]],
  ["Analista FinOps", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Analista SRE", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Arquiteto Cloud", [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215], [220, 230]],
  ["Arquiteto de Dados", [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Arquiteto de IA", [180, 190], [195, 205], [210, 220], [225, 235], [240, 250], [255, 265], [270, 280]],
  ["Arquiteto de Software", [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Arquiteto de Solução", [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215], [220, 230]],
  ["Cientista de Dados", [165, 175], [180, 190], [195, 205], [210, 220], [225, 235], [240, 250], [255, 265]],
  ["Consultor Protheus", [70, 80], [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170]],
  ["Consultor SR", [80, 90], [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180]],
  ["Coordenador de Projetos", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["DBA Oracle", [65, 75], [80, 90], [95, 105], [110, 120], [125, 135], [140, 150], [155, 165]],
  ["Delivery Manager", [165, 175], [180, 190], [195, 205], [210, 220], [225, 235], [240, 250], [255, 265]],
  ["Desenvolvedor .ESG / GIS", [115, 125], [145, 155], [165, 175], [185, 195], [205, 215], [225, 235], [275, 285]],
  ["Desenvolvedor .NET", [95, 105], [110, 125], [130, 145], [150, 165], [175, 190], [195, 215], [225, 235]],
  ["Desenvolvedor Angular", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [175, 185], [190, 200]],
  ["Desenvolvedor Backend Mobile", [110, 120], [125, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Desenvolvedor Calypso", [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210]],
  ["Desenvolvedor COBOL", [60, 70], [75, 85], [90, 100], [105, 115], [120, 130], [135, 145], [150, 160]],
  ["Desenvolvedor de IA", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Desenvolvedor Excell", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Flutter", [90, 100], [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190]],
  ["Desenvolvedor Frontend Mobile", [110, 120], [125, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Desenvolvedor Fullstack", [110, 120], [125, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Desenvolvedor Java", [110, 120], [125, 135], [140, 150], [160, 175], [180, 190], [195, 205], [207, 215]],
  ["Desenvolvedor Node", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Desenvolvedor Node JS", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["Desenvolvedor PHP", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Desenvolvedor Python", [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205], [210, 220]],
  ["Desenvolvedor React", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Desenvolvedor RPA", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Desenvolvedor Salesforce", [145, 155], [160, 170], [175, 185], [190, 200], [205, 215], [220, 230], [235, 245]],
  ["Desenvolvedor SAP", [170, 180], [185, 195], [200, 210], [215, 225], [230, 240], [245, 255], [260, 270]],
  ["Desenvolvedor ServiceNow", [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200]],
  ["Designer UI", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Designer UX", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["DevOps", [140, 150], [155, 165], [170, 180], [185, 195], [200, 210], [215, 225], [230, 240]],
  ["DevSecOps", [155, 165], [170, 180], [185, 195], [200, 210], [215, 225], [230, 240], [245, 255]],
  ["Engenheiro de Cibersegurança", [125, 135], [140, 150], [155, 165], [170, 180], [185, 195], [200, 210], [215, 225]],
  ["Engenheiro de Dados", [150, 160], [165, 175], [180, 190], [195, 205], [210, 220], [225, 235], [240, 250]],
  ["Engenheiro de IA", [180, 190], [195, 205], [210, 220], [225, 235], [240, 250], [255, 265], [270, 280]],
  ["Engenheiro de Machine Learning", [180, 190], [195, 205], [210, 220], [225, 235], [240, 250], [255, 265], [270, 280]],
  ["Gerente de Projetos", [155, 165], [170, 180], [185, 195], [200, 210], [215, 225], [230, 240], [245, 255]],
  ["Gerente de Segurança da Informação", [185, 195], [200, 210], [215, 225], [230, 240], [245, 255], [260, 270], [275, 285]],
  ["Gerente PMO", [115, 125], [130, 140], [145, 155], [160, 170], [175, 185], [190, 200], [205, 215]],
  ["Líder de Desenvolvimento", [170, 180], [185, 195], [200, 210], [215, 225], [230, 240], [245, 255], [260, 270]],
  ["Product Manager", [155, 165], [170, 180], [185, 195], [200, 210], [215, 225], [230, 240], [245, 255]],
  ["Product Owner", [105, 115], [120, 130], [135, 145], [150, 160], [165, 175], [180, 190], [195, 205]],
  ["QA Automação", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["QA Lead", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["QA Manual", [70, 80], [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170]],
  ["SAP BASIS", [95, 105], [110, 120], [125, 135], [140, 150], [155, 165], [170, 180], [185, 195]],
  ["Scrum Master", [140, 150], [155, 165], [170, 180], [185, 195], [200, 210], [215, 225], [230, 240]],
  ["Tech Leader", [200, 210], [215, 225], [230, 240], [245, 255], [260, 270], [275, 285], [290, 300]],
  ["Técnico de Sistema", [85, 95], [100, 110], [115, 125], [130, 140], [145, 155], [160, 170], [175, 185]],
];

export const BTG_PROFILES: BtgProfile[] = BTG_ROWS.map(row).sort((a, b) =>
  a.profile.localeCompare(b.profile, "pt-BR"),
);

export const BTG_PROFILE_NAMES = BTG_PROFILES.map((p) => p.profile);

export function findBtgProfile(name: string) {
  return BTG_PROFILES.find((p) => p.profile === name);
}

export function btgRange(profile: string, seniority: BtgSeniority): HourRange | undefined {
  return findBtgProfile(profile)?.rates[seniority];
}

export function btgMidHourly(profile: string, seniority: BtgSeniority): number {
  const range = btgRange(profile, seniority);
  if (!range) return 0;
  return Math.round(((range.min + range.max) / 2) * 100) / 100;
}

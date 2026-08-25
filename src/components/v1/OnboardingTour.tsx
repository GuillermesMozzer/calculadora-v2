import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export const V1_TOUR_KEY = "calculadora_v1_tutorial_done";

type SectionKey = "perfil" | "valores" | "extras" | "breakdown";

export type TourStep = {
  id: string;
  title: string;
  body: string;
  target?: string;
  section?: SectionKey;
};

export const V1_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo à Calculadora V1",
    body: "Este tutorial mostra o caminho básico para precificar um talento. Você pode avançar, voltar ou pular a qualquer momento.",
    section: "perfil",
  },
  {
    id: "ratecard",
    title: "1. Escolha a tabela ratecard",
    body: "Comece pela tabela. O padrão é Ratecard Taking (salário). A Ratecard BTG usa faixa de venda em R$/hora. Depois você pode criar ou importar outras tabelas.",
    target: "tour-ratecard",
    section: "perfil",
  },
  {
    id: "competency",
    title: "2. Competência técnica",
    body: "Digite para buscar ou selecione o perfil na lista. Ao escolher a competência, os valores da calculadora são preenchidos automaticamente.",
    target: "tour-competency",
    section: "perfil",
  },
  {
    id: "seniority",
    title: "3. Senioridade",
    body: "Selecione o nível: Júnior, Júnior II, Pleno, Pleno II, Sênior, Sênior II ou Especialista / Arquiteto. O lápis abre a tabela completa para consultar, editar, importar ou exportar.",
    target: "tour-seniority",
    section: "perfil",
  },
  {
    id: "contract",
    title: "4. Modelo e horas",
    body: "Escolha CLT Full, CLT Estratégico ou PJ. As horas vêm em 168/mês — altere se o contrato for diferente. Com esses passos, o restante já calcula sozinho.",
    target: "tour-contract",
    section: "perfil",
  },
  {
    id: "calculator",
    title: "Calculadora e cadeados",
    body: "Hora de venda, salário e margem sobem sozinhos. Edite qualquer campo para simular. O cadeado trava um valor: por exemplo, trave a margem em 32% e mude a hora de venda — o restante se ajusta.",
    target: "tour-calculator",
    section: "valores",
  },
  {
    id: "benefits",
    title: "Recursos e benefícios",
    body: "Notebook já vem selecionado. Vale alimentação segue a faixa de salário (500 / 1.000 / 1.500 / 2.000) e o vale refeição começa em R$ 700. Qualquer alteração entra no custo na hora.",
    target: "tour-benefits",
    section: "extras",
  },
  {
    id: "breakdown",
    title: "Breakdown de custo",
    body: "Aqui aparece a composição do custo Taking (encargos, benefícios, infra, SGA). A seção começa fechada — abra quando quiser conferir os números.",
    target: "tour-breakdown",
    section: "breakdown",
  },
  {
    id: "summary",
    title: "Resultado geral",
    body: "O painel à direita (no celular, no topo) mostra preço de venda, margem, alçada e custos. Ele acompanha tudo o que você alterar.",
    target: "tour-summary",
  },
  {
    id: "done",
    title: "Pronto para precificar",
    body: "Siga a ordem: ratecard → competência → senioridade → contrato → horas. Depois ajuste valores, benefícios e cadeados se precisar. Bom trabalho.",
    section: "perfil",
  },
];

type Props = {
  open: boolean;
  stepIndex: number;
  onStep: (index: number) => void;
  onSkip: () => void;
  onFinish: () => void;
};

export function OnboardingTour({ open, stepIndex, onStep, onSkip, onFinish }: Props) {
  const step = V1_TOUR_STEPS[stepIndex];
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!open || !step?.target) {
      setRect(null);
      return;
    }

    function measure() {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setRect(el.getBoundingClientRect());
    }

    const t1 = window.setTimeout(measure, 80);
    const t2 = window.setTimeout(measure, 280);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step?.target, stepIndex]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight") {
        if (stepIndex >= V1_TOUR_STEPS.length - 1) onFinish();
        else onStep(stepIndex + 1);
      }
      if (e.key === "ArrowLeft" && stepIndex > 0) onStep(stepIndex - 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, stepIndex, onSkip, onFinish, onStep]);

  if (!open || !step) return null;

  const last = stepIndex >= V1_TOUR_STEPS.length - 1;
  const first = stepIndex === 0;
  const pad = 8;
  const tooltip = tooltipStyle(rect);

  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="v1-tour-title">
      {rect ? (
        <div
          className="pointer-events-none rounded-2xl ring-2 ring-taking"
          style={{
            position: "fixed",
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.62)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/55" />
      )}

      <div
        className={cn(
          "pointer-events-auto absolute w-[min(100%-1.5rem,380px)] rounded-2xl border border-border/15 bg-surface-raised p-5 shadow-glow",
          !rect && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={rect ? tooltip : undefined}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-taking">
          Tutorial · {stepIndex + 1} de {V1_TOUR_STEPS.length}
        </p>
        <h3 id="v1-tour-title" className="mt-2 text-base font-semibold text-foreground">
          {step.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-muted hover:text-foreground"
          >
            Pular tutorial
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={first}
              onClick={() => onStep(stepIndex - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-border/15 px-3 py-2 text-xs font-medium disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => (last ? onFinish() : onStep(stepIndex + 1))}
              className="inline-flex items-center gap-1 rounded-xl bg-taking px-3 py-2 text-xs font-semibold text-white hover:bg-taking-hover"
            >
              {last ? "Concluir" : "Próximo"}
              {!last && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function tooltipStyle(rect: DOMRect | null): CSSProperties | undefined {
  if (!rect) return undefined;
  const width = Math.min(380, window.innerWidth - 24);
  const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
  const below = rect.bottom + 16;
  const placeBelow = rect.top < window.innerHeight * 0.45;
  if (placeBelow) {
    return { top: Math.min(below, window.innerHeight - 220), left, width };
  }
  return { top: Math.max(12, rect.top - 16), left, width, transform: "translateY(-100%)" };
}

export function isV1TourDone() {
  try {
    return localStorage.getItem(V1_TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function markV1TourDone() {
  localStorage.setItem(V1_TOUR_KEY, "1");
}

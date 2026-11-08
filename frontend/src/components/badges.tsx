import { Ban, Hourglass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { dias } from "@/lib/format";
import {
  MOSCOW,
  NIVEL_AGING,
  PRIORIDADE,
  STATUS_PROJETO,
  STATUS_REQUISITO,
  STATUS_TAREFA,
  TIPO_REQUISITO,
} from "@/lib/labels";
import type {
  NivelAging,
  Prioridade,
  PrioridadeMoscow,
  StatusProjeto,
  StatusRequisito,
  StatusTarefa,
  TipoRequisito,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const tom = {
  neutro: "bg-muted text-muted-foreground",
  azul: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  verde: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  amarelo: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  vermelho: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  roxo: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
} as const;

function Pill({ cor, children, className }: { cor: keyof typeof tom; children: React.ReactNode; className?: string }) {
  return (
    <Badge variant="secondary" className={cn(tom[cor], className)}>
      {children}
    </Badge>
  );
}

export function StatusProjetoBadge({ status }: { status: StatusProjeto }) {
  const cor = { DISCOVERY: "roxo", EM_ANDAMENTO: "azul", PAUSADO: "amarelo", CONCLUIDO: "verde" } as const;
  return <Pill cor={cor[status]}>{STATUS_PROJETO[status]}</Pill>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const cor = { ALTA: "vermelho", MEDIA: "amarelo", BAIXA: "neutro" } as const;
  return <Pill cor={cor[prioridade]}>{PRIORIDADE[prioridade]}</Pill>;
}

export function MoscowBadge({ prioridade }: { prioridade: PrioridadeMoscow }) {
  const cor = { MUST: "vermelho", SHOULD: "amarelo", COULD: "azul", WONT: "neutro" } as const;
  return <Pill cor={cor[prioridade]}>{MOSCOW[prioridade]}</Pill>;
}

export function TipoRequisitoBadge({ tipo }: { tipo: TipoRequisito }) {
  return <Pill cor={tipo === "FUNCIONAL" ? "azul" : "roxo"}>{TIPO_REQUISITO[tipo]}</Pill>;
}

export function StatusRequisitoBadge({ status }: { status: StatusRequisito }) {
  const cor = { RASCUNHO: "neutro", VALIDADO: "azul", APROVADO: "verde", DESCARTADO: "vermelho" } as const;
  return <Pill cor={cor[status]}>{STATUS_REQUISITO[status]}</Pill>;
}

export function StatusTarefaBadge({ status }: { status: StatusTarefa }) {
  const cor = { A_FAZER: "neutro", EM_ANDAMENTO: "azul", CONCLUIDA: "verde" } as const;
  return <Pill cor={cor[status]}>{STATUS_TAREFA[status]}</Pill>;
}

const corAging: Record<NivelAging, keyof typeof tom> = { VERDE: "verde", AMARELO: "amarelo", VERMELHO: "vermelho" };

/** Idade do item em WIP com cor pela faixa configurada no backend. */
export function AgingBadge({ idade, nivel }: { idade: number | null; nivel: NivelAging | null }) {
  if (idade == null || nivel == null) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Pill cor={corAging[nivel]}>
            <Hourglass />
            {idade}d
          </Pill>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Aging WIP: {dias(idade)} em andamento · {NIVEL_AGING[nivel]}
      </TooltipContent>
    </Tooltip>
  );
}

export function ImpedidoBadge({ dias: d, motivo }: { dias: number | null; motivo: string | null }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Badge variant="destructive">
            <Ban />
            Impedido{d != null ? ` · ${d}d` : ""}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{motivo ?? "Sem motivo informado"}</TooltipContent>
    </Tooltip>
  );
}

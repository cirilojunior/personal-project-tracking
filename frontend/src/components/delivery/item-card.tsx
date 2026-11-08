"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ListChecks } from "lucide-react";

import { AgingBadge, ImpedidoBadge, PrioridadeBadge } from "@/components/badges";
import { dias } from "@/lib/format";
import type { ItemResumo } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ItemCardConteudo({
  item,
  mostrarProjeto,
  arrastando,
}: {
  item: ItemResumo;
  mostrarProjeto?: boolean;
  arrastando?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3 text-left text-sm shadow-xs transition-shadow",
        item.impedido && "border-l-4 border-destructive/60 border-l-destructive bg-destructive/5",
        arrastando && "rotate-1 shadow-lg ring-2 ring-ring",
      )}
    >
      {mostrarProjeto && <span className="truncate text-xs text-muted-foreground">{item.projetoNome}</span>}
      <p className="font-medium leading-snug">{item.titulo}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <PrioridadeBadge prioridade={item.prioridade} />
        <AgingBadge idade={item.idadeWipDias} nivel={item.nivelAging} />
        {item.impedido && <ImpedidoBadge dias={item.diasImpedido} motivo={item.motivoImpedimento} />}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {item.subtarefasTotal > 0 ? (
          <span className="flex items-center gap-1">
            <ListChecks className="size-3.5" />
            {item.subtarefasConcluidas}/{item.subtarefasTotal}
          </span>
        ) : (
          <span />
        )}
        <span title="Tempo na coluna atual">{dias(item.diasNoStatus)} na coluna</span>
      </div>
    </div>
  );
}

/** Card arrastável do board; clique abre os detalhes. */
export function ItemCard({
  item,
  mostrarProjeto,
  onAbrir,
}: {
  item: ItemResumo;
  mostrarProjeto?: boolean;
  onAbrir: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { status: item.status },
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("list-none", isDragging && "opacity-40")}
    >
      <button
        type="button"
        className="w-full cursor-grab rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        aria-label={`${item.titulo}. Abrir detalhes; espaço para arrastar`}
        onClick={() => onAbrir(item.id)}
        {...attributes}
        {...listeners}
      >
        <ItemCardConteudo item={item} mostrarProjeto={mostrarProjeto} />
      </button>
    </li>
  );
}

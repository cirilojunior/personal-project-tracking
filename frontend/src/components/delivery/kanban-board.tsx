"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { Ban, Plus } from "lucide-react";
import { useState } from "react";

import { Carregando, Erro } from "@/components/estados";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useMutacao } from "@/lib/hooks";
import { STATUS_ITEM, STATUS_ITEM_ORDEM } from "@/lib/labels";
import type { ItemResumo, StatusItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ItemCard, ItemCardConteudo } from "./item-card";
import { ItemDialog } from "./item-dialog";
import { ItemSheet } from "./item-sheet";

type Colunas = Record<StatusItem, ItemResumo[]>;

const prefixo = "coluna:";

function Coluna({
  status,
  itens,
  mostrarProjeto,
  onAbrir,
}: {
  status: StatusItem;
  itens: ItemResumo[];
  mostrarProjeto: boolean;
  onAbrir: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: prefixo + status });
  const impedidos = itens.filter((i) => i.impedido).length;

  return (
    <section
      aria-label={`Coluna ${STATUS_ITEM[status]}`}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl bg-muted/50 transition-colors",
        isOver && "bg-muted",
        status === "CONCLUIDO" && "bg-emerald-50/60 dark:bg-emerald-950/20",
      )}
    >
      <header className="flex items-start justify-between gap-2 px-3 pt-3 pb-2">
        <h3 className="text-sm leading-tight font-semibold">{STATUS_ITEM[status]}</h3>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          {impedidos > 0 && (
            <span className="flex items-center gap-0.5 font-medium text-destructive" title="Itens impedidos">
              <Ban className="size-3" />
              {impedidos}
            </span>
          )}
          <span className="rounded-full bg-background px-2 py-0.5 tabular-nums">{itens.length}</span>
        </div>
      </header>
      <SortableContext items={itens.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-3">
          {itens.map((item) => (
            <ItemCard key={item.id} item={item} mostrarProjeto={mostrarProjeto} onAbrir={onAbrir} />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}

function agrupar(colunas: { status: StatusItem; itens: ItemResumo[] }[]): Colunas {
  return Object.fromEntries(colunas.map((c) => [c.status, c.itens])) as Colunas;
}

function localizar(colunas: Colunas, id: string | number): StatusItem | undefined {
  if (typeof id === "string" && id.startsWith(prefixo)) return id.slice(prefixo.length) as StatusItem;
  return STATUS_ITEM_ORDEM.find((s) => colunas[s].some((i) => i.id === id));
}

/** Board Kanban de Delivery. Sem {@code projetoId} mostra os itens de todos os projetos. */
export function KanbanBoard({ projetoId }: { projetoId?: number }) {
  const board = useQuery({ queryKey: ["board", projetoId ?? null], queryFn: () => api.board(projetoId) });
  // Rascunho otimista do arraste; vale só enquanto os dados do servidor não forem recarregados.
  const [rascunho, setRascunhoBruto] = useState<{ versao: number; colunas: Colunas } | null>(null);
  const [ativo, setAtivo] = useState<ItemResumo | null>(null);
  const [aberto, setAberto] = useState<number | null>(null);

  const mover = useMutacao(({ id, status, ordem }: { id: number; status: StatusItem; ordem: number }) =>
    api.itens.mover(id, status, ordem),
  );

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (board.isPending) return <Carregando />;
  if (board.isError) return <Erro erro={board.error} tentarNovamente={() => board.refetch()} />;

  const versao = board.dataUpdatedAt;
  const colunas: Colunas =
    rascunho && rascunho.versao === versao ? rascunho.colunas : agrupar(board.data.colunas);
  const setColunas = (fn: Colunas | ((c: Colunas) => Colunas)) =>
    setRascunhoBruto((r) => {
      const base = r && r.versao === versao ? r.colunas : agrupar(board.data.colunas);
      return { versao, colunas: typeof fn === "function" ? fn(base) : fn };
    });

  const { limiteAtencaoDias, limiteCriticoDias } = board.data.limitesAging;
  const total = STATUS_ITEM_ORDEM.reduce((n, s) => n + colunas[s].length, 0);

  function onDragStart(e: DragStartEvent) {
    const status = localizar(colunas, e.active.id);
    setAtivo(status ? (colunas[status].find((i) => i.id === e.active.id) ?? null) : null);
  }

  // Move o card entre colunas enquanto arrasta (pré-visualização).
  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const de = localizar(colunas, active.id);
    const para = localizar(colunas, over.id);
    if (!de || !para || de === para) return;
    setColunas((atual) => {
      const item = atual[de].find((i) => i.id === active.id);
      if (!item) return atual;
      const destino = atual[para].filter((i) => i.id !== item.id);
      const idx = destino.findIndex((i) => i.id === over.id);
      destino.splice(idx >= 0 ? idx : destino.length, 0, { ...item, status: para });
      return { ...atual, [de]: atual[de].filter((i) => i.id !== item.id), [para]: destino };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    const original = ativo;
    setAtivo(null);
    if (!over || !original) return;
    const para = localizar(colunas, active.id);
    if (!para) return;

    const lista = [...colunas[para]];
    const de = lista.findIndex((i) => i.id === active.id);
    const sobre = lista.findIndex((i) => i.id === over.id);
    if (sobre >= 0 && sobre !== de) {
      const [item] = lista.splice(de, 1);
      lista.splice(sobre, 0, item);
      setColunas({ ...colunas, [para]: lista });
    }
    const pos = lista.findIndex((i) => i.id === active.id);
    // A ordem no backend é por projeto: conta só os itens do mesmo projeto acima do card.
    const ordem = lista.slice(0, pos).filter((i) => i.projetoId === original.projetoId).length;
    if (para === original.status && ordem === original.ordem) return;
    mover.mutate({ id: original.id, status: para, ordem });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {total} itens · Aging WIP: <span className="text-emerald-700 dark:text-emerald-400">verde</span> até{" "}
          {limiteAtencaoDias - 1}d, <span className="text-amber-700 dark:text-amber-400">amarelo</span> até{" "}
          {limiteCriticoDias}d, <span className="text-red-700 dark:text-red-400">vermelho</span> acima. Arraste os
          cards ou abra um item para mudar o status.
        </p>
        {projetoId && (
          <ItemDialog
            projetoId={projetoId}
            gatilho={
              <Button size="sm">
                <Plus /> Novo item
              </Button>
            }
          />
        )}
      </div>

      <DndContext
        sensors={sensores}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setAtivo(null);
          setRascunhoBruto(null);
        }}
      >
        <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6">
          <div className="flex gap-3">
            {STATUS_ITEM_ORDEM.map((s) => (
              <Coluna key={s} status={s} itens={colunas[s]} mostrarProjeto={!projetoId} onAbrir={setAberto} />
            ))}
          </div>
        </div>
        <DragOverlay>
          {ativo && <ItemCardConteudo item={ativo} mostrarProjeto={!projetoId} arrastando />}
        </DragOverlay>
      </DndContext>

      <ItemSheet itemId={aberto} onFechar={() => setAberto(null)} />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Ban, CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { AgingBadge, PrioridadeBadge } from "@/components/badges";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Carregando, Erro } from "@/components/estados";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { dataHora, dias, relativo } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import { STATUS_ITEM, STATUS_ITEM_ORDEM } from "@/lib/labels";
import type { ItemDetalhe, StatusItem } from "@/lib/types";
import { ItemDialog } from "./item-dialog";

function Impedimento({ item }: { item: ItemDetalhe }) {
  const [motivo, setMotivo] = useState("");
  const [editando, setEditando] = useState(false);
  const impedir = useMutacao((m: string) => api.itens.impedir(item.id, m), {
    sucesso: "Item marcado como impedido",
    onSuccess: () => setEditando(false),
  });
  const liberar = useMutacao(() => api.itens.desimpedir(item.id), { sucesso: "Impedimento removido" });

  if (item.status === "CONCLUIDO") return null;

  if (item.impedido) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
        <div className="flex items-center gap-2 font-medium text-destructive">
          <Ban className="size-4" /> Impedido há {dias(item.diasImpedido)}
        </div>
        <p className="text-sm whitespace-pre-line">{item.motivoImpedimento ?? "Sem motivo informado."}</p>
        <p className="text-xs text-muted-foreground">Desde {dataHora(item.impedidoDesde)}</p>
        <Button variant="outline" size="sm" className="self-start" onClick={() => liberar.mutate()} disabled={liberar.isPending}>
          <CheckCircle2 /> Remover impedimento
        </Button>
      </div>
    );
  }

  if (!editando) {
    return (
      <Button variant="outline" size="sm" className="self-start" onClick={() => setEditando(true)}>
        <Ban /> Marcar como impedido
      </Button>
    );
  }

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border p-3"
      onSubmit={(e) => {
        e.preventDefault();
        impedir.mutate(motivo);
      }}
    >
      <Label htmlFor="motivo">Motivo do impedimento</Label>
      <Textarea
        id="motivo"
        rows={3}
        value={motivo}
        maxLength={1000}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Ex.: aguardando acesso ao ambiente do cliente"
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={impedir.isPending}>
          Marcar impedido
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditando(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Subtarefas({ item }: { item: ItemDetalhe }) {
  const [titulo, setTitulo] = useState("");
  const adicionar = useMutacao((t: string) => api.itens.adicionarSubtarefa(item.id, t), {
    onSuccess: () => setTitulo(""),
  });
  const alternar = useMutacao(({ id, t, c }: { id: number; t: string; c: boolean }) =>
    api.itens.atualizarSubtarefa(item.id, id, t, c),
  );
  const remover = useMutacao((id: number) => api.itens.excluirSubtarefa(item.id, id));
  const feitas = item.subtarefas.filter((s) => s.concluida).length;
  const total = item.subtarefas.length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Subtarefas</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {feitas}/{total}
        </span>
      </div>
      {total > 0 && <Progress value={(feitas / total) * 100} aria-label="Progresso das subtarefas" />}
      <ul className="flex flex-col gap-1">
        {item.subtarefas.map((s) => (
          <li key={s.id} className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/60">
            <Checkbox
              id={`sub-${s.id}`}
              checked={s.concluida}
              onCheckedChange={(v) => alternar.mutate({ id: s.id, t: s.titulo, c: v === true })}
            />
            <Label
              htmlFor={`sub-${s.id}`}
              className={`flex-1 font-normal ${s.concluida ? "text-muted-foreground line-through" : ""}`}
            >
              {s.titulo}
            </Label>
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-60 group-hover:opacity-100"
              aria-label={`Remover subtarefa ${s.titulo}`}
              onClick={() => remover.mutate(s.id)}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (titulo.trim()) adicionar.mutate(titulo.trim());
        }}
      >
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nova subtarefa"
          aria-label="Nova subtarefa"
          maxLength={200}
        />
        <Button type="submit" size="icon" variant="outline" aria-label="Adicionar subtarefa" disabled={adicionar.isPending}>
          <Plus />
        </Button>
      </form>
    </section>
  );
}

function Detalhes({ item, onFechar }: { item: ItemDetalhe; onFechar: () => void }) {
  const mover = useMutacao((s: StatusItem) => api.itens.mover(item.id, s, 9999), {
    sucesso: (r) => `Movido para ${STATUS_ITEM[r.status]}`,
  });
  const excluir = useMutacao(() => api.itens.excluir(item.id), { sucesso: "Item excluído", onSuccess: onFechar });

  return (
    <>
      <SheetHeader className="gap-2 border-b">
        <span className="text-xs text-muted-foreground">{item.projetoNome}</span>
        <SheetTitle className="pr-8 text-lg leading-snug">{item.titulo}</SheetTitle>
        <SheetDescription className="sr-only">Detalhes do item de trabalho</SheetDescription>
        <div className="flex flex-wrap items-center gap-1.5">
          <PrioridadeBadge prioridade={item.prioridade} />
          <AgingBadge idade={item.idadeWipDias} nivel={item.nivelAging} />
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="status-item">Status</Label>
          <Select value={item.status} onValueChange={(v) => mover.mutate(v as StatusItem)}>
            <SelectTrigger id="status-item" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ITEM_ORDEM.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_ITEM[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Nesta coluna há {dias(item.diasNoStatus)} (desde {dataHora(item.statusDesde)}).
          </p>
        </div>

        <Impedimento item={item} />

        {item.descricao && <p className="text-sm whitespace-pre-line">{item.descricao}</p>}

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Criado</dt>
            <dd>{dataHora(item.criadoEm)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Início do WIP</dt>
            <dd>{dataHora(item.inicioWip)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Idade em WIP</dt>
            <dd>{dias(item.idadeWipDias)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Concluído</dt>
            <dd>{dataHora(item.concluidoEm)}</dd>
          </div>
        </dl>

        <Separator />
        <Subtarefas item={item} />
        <Separator />

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Histórico de status</h3>
          <ol className="relative flex flex-col gap-3 border-l pl-4">
            {[...item.historico].reverse().map((h, i) => (
              <li key={i} className="text-sm">
                <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full border bg-background" />
                <p>
                  {h.statusAnterior ? (
                    <>
                      {STATUS_ITEM[h.statusAnterior]} → <strong>{STATUS_ITEM[h.statusNovo]}</strong>
                    </>
                  ) : (
                    <>
                      Criado em <strong>{STATUS_ITEM[h.statusNovo]}</strong>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground" title={dataHora(h.ocorridoEm)}>
                  {relativo(h.ocorridoEm)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="flex justify-between gap-2 border-t p-4">
        <ConfirmarExclusao
          titulo="Excluir item de trabalho?"
          descricao="Subtarefas e histórico também serão excluídos."
          onConfirmar={() => excluir.mutate()}
        >
          <Button variant="ghost" className="text-destructive">
            <Trash2 /> Excluir
          </Button>
        </ConfirmarExclusao>
        <ItemDialog
          projetoId={item.projetoId}
          item={item}
          gatilho={
            <Button variant="outline">
              <Pencil /> Editar
            </Button>
          }
        />
      </div>
    </>
  );
}

export function ItemSheet({ itemId, onFechar }: { itemId: number | null; onFechar: () => void }) {
  const item = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => api.itens.buscar(itemId!),
    enabled: itemId != null,
  });

  return (
    <Sheet open={itemId != null} onOpenChange={(v) => !v && onFechar()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {item.isPending ? (
          <div className="p-6">
            <SheetTitle className="sr-only">Carregando item</SheetTitle>
            <Carregando />
          </div>
        ) : item.isError ? (
          <div className="p-6">
            <SheetTitle className="sr-only">Erro</SheetTitle>
            <Erro erro={item.error} />
          </div>
        ) : (
          <Detalhes item={item.data} onFechar={onFechar} />
        )}
      </SheetContent>
    </Sheet>
  );
}

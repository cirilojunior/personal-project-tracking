"use client";

import { useQuery } from "@tanstack/react-query";
import { KanbanSquare, Pencil, Plus, Send, Trash2 } from "lucide-react";

import { PrioridadeBadge, StatusTarefaBadge } from "@/components/badges";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Carregando, Erro, Vazio } from "@/components/estados";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { useMutacao } from "@/lib/hooks";
import { STATUS_ITEM } from "@/lib/labels";
import { TarefaDialog } from "./tarefa-dialog";

export function TarefasSecao({ projetoId, onVerNoBoard }: { projetoId: number; onVerNoBoard: () => void }) {
  const tarefas = useQuery({ queryKey: ["tarefas", projetoId], queryFn: () => api.tarefas.listar(projetoId) });
  const excluir = useMutacao((id: number) => api.tarefas.excluir(id), { sucesso: "Tarefa excluída" });
  const enviar = useMutacao((id: number) => api.tarefas.enviarParaDelivery(id), {
    sucesso: "Tarefa enviada para o board de Delivery (coluna Selecionado)",
  });

  const nova = (
    <TarefaDialog
      projetoId={projetoId}
      gatilho={
        <Button size="sm">
          <Plus /> Nova tarefa
        </Button>
      }
    />
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">Tarefas de alto nível</h2>
          <p className="text-sm text-muted-foreground">
            Envie uma tarefa ao Delivery para transformá-la em item de trabalho no board.
          </p>
        </div>
        {nova}
      </div>

      {tarefas.isPending ? (
        <Carregando linhas={3} />
      ) : tarefas.isError ? (
        <Erro erro={tarefas.error} tentarNovamente={() => tarefas.refetch()} />
      ) : tarefas.data.length === 0 ? (
        <Vazio titulo="Nenhuma tarefa ainda" descricao="Quebre o escopo em tarefas de alto nível." acao={nova} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {tarefas.data.map((t) => (
            <Card key={t.id} size="sm">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{t.titulo}</p>
                    {t.descricao && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.descricao}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <TarefaDialog
                      projetoId={projetoId}
                      tarefa={t}
                      gatilho={
                        <Button variant="ghost" size="icon-sm" aria-label="Editar tarefa">
                          <Pencil />
                        </Button>
                      }
                    />
                    <ConfirmarExclusao
                      titulo="Excluir tarefa?"
                      descricao="O item de trabalho criado a partir dela (se houver) continuará no board."
                      onConfirmar={() => excluir.mutate(t.id)}
                    >
                      <Button variant="ghost" size="icon-sm" aria-label="Excluir tarefa">
                        <Trash2 />
                      </Button>
                    </ConfirmarExclusao>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PrioridadeBadge prioridade={t.prioridade} />
                  <StatusTarefaBadge status={t.status} />
                  {t.requisitos.map((r) => (
                    <Tooltip key={r.id}>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="font-mono">
                          {r.codigo}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{r.titulo}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 border-t pt-3">
                  {t.itemTrabalho ? (
                    <>
                      <span className="text-sm text-muted-foreground">
                        No Delivery: <span className="text-foreground">{STATUS_ITEM[t.itemTrabalho.status]}</span>
                      </span>
                      <Button variant="outline" size="sm" onClick={onVerNoBoard}>
                        <KanbanSquare /> Ver no board
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Ainda não está no Delivery</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={enviar.isPending}
                        onClick={() => enviar.mutate(t.id)}
                      >
                        <Send /> Enviar para Delivery
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

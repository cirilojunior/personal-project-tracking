"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { MoscowBadge, StatusRequisitoBadge, TipoRequisitoBadge } from "@/components/badges";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Carregando, Erro, Vazio } from "@/components/estados";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useMutacao } from "@/lib/hooks";
import { CATEGORIA_NFR, MOSCOW, opcoes, STATUS_REQUISITO, TIPO_REQUISITO } from "@/lib/labels";
import { RequisitoDialog } from "./requisito-dialog";

const TODOS = "TODOS";

function Filtro({
  valor,
  onChange,
  rotulo,
  todos,
  mapa,
}: {
  valor: string;
  onChange: (v: string) => void;
  rotulo: string;
  todos: string;
  mapa: Record<string, string>;
}) {
  return (
    <Select value={valor} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-40" aria-label={rotulo}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{todos}</SelectItem>
        {opcoes(mapa).map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RequisitosSecao({ projetoId }: { projetoId: number }) {
  const requisitos = useQuery({ queryKey: ["requisitos", projetoId], queryFn: () => api.requisitos.listar(projetoId) });
  const excluir = useMutacao((id: number) => api.requisitos.excluir(id), { sucesso: "Requisito excluído" });
  const [tipo, setTipo] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [moscow, setMoscow] = useState(TODOS);

  const filtrados = (requisitos.data ?? []).filter(
    (r) =>
      (tipo === TODOS || r.tipo === tipo) &&
      (status === TODOS || r.status === status) &&
      (moscow === TODOS || r.prioridade === moscow),
  );
  const total = requisitos.data?.length ?? 0;
  const funcionais = requisitos.data?.filter((r) => r.tipo === "FUNCIONAL").length ?? 0;

  const novo = (
    <RequisitoDialog
      projetoId={projetoId}
      gatilho={
        <Button size="sm">
          <Plus /> Novo requisito
        </Button>
      }
    />
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">Requisitos</h2>
          <p className="text-sm text-muted-foreground">
            {total} no total · {funcionais} funcionais · {total - funcionais} não funcionais
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filtro valor={tipo} onChange={setTipo} rotulo="Filtrar por tipo" todos="Todos os tipos" mapa={TIPO_REQUISITO} />
          <Filtro valor={moscow} onChange={setMoscow} rotulo="Filtrar por prioridade" todos="Todas as prioridades" mapa={MOSCOW} />
          <Filtro valor={status} onChange={setStatus} rotulo="Filtrar por status" todos="Todos os status" mapa={STATUS_REQUISITO} />
          {novo}
        </div>
      </div>

      {requisitos.isPending ? (
        <Carregando linhas={3} />
      ) : requisitos.isError ? (
        <Erro erro={requisitos.error} tentarNovamente={() => requisitos.refetch()} />
      ) : total === 0 ? (
        <Vazio
          titulo="Nenhum requisito ainda"
          descricao="Registre os requisitos funcionais e não funcionais levantados com o cliente."
          acao={novo}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-24">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhum requisito com esses filtros.
                  </TableCell>
                </TableRow>
              )}
              {filtrados.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.codigo}</TableCell>
                  <TableCell className="max-w-md whitespace-normal">
                    <div className="font-medium">{r.titulo}</div>
                    {r.descricao && <div className="line-clamp-2 text-xs text-muted-foreground">{r.descricao}</div>}
                    {r.categoriaNfr && (
                      <div className="text-xs text-muted-foreground">Categoria: {CATEGORIA_NFR[r.categoriaNfr]}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <TipoRequisitoBadge tipo={r.tipo} />
                  </TableCell>
                  <TableCell>
                    <MoscowBadge prioridade={r.prioridade} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusRequisitoBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <RequisitoDialog
                        projetoId={projetoId}
                        requisito={r}
                        gatilho={
                          <Button variant="ghost" size="icon-sm" aria-label={`Editar ${r.codigo}`}>
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmarExclusao
                        titulo={`Excluir ${r.codigo}?`}
                        descricao="O requisito também será desvinculado das tarefas."
                        onConfirmar={() => excluir.mutate(r.id)}
                      >
                        <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${r.codigo}`}>
                          <Trash2 />
                        </Button>
                      </ConfirmarExclusao>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

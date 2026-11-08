"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Carregando, Erro, Vazio } from "@/components/estados";
import { PageHeader } from "@/components/page-header";
import { ProjetoCard } from "@/components/projeto-card";
import { ProjetoDialog } from "@/components/projeto-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { opcoes, STATUS_PROJETO } from "@/lib/labels";
import type { StatusProjeto } from "@/lib/types";

const TODOS = "TODOS";

export default function ProjetosPage() {
  const [status, setStatus] = useState<string>(TODOS);
  const filtro = status === TODOS ? {} : { status: status as StatusProjeto };
  const projetos = useQuery({ queryKey: ["projetos", filtro], queryFn: () => api.projetos.listar(filtro) });

  const novo = (
    <ProjetoDialog
      gatilho={
        <Button>
          <Plus /> Novo projeto
        </Button>
      }
    />
  );

  return (
    <>
      <PageHeader
        titulo="Projetos"
        descricao="Cada projeto passa pelo Discovery (requisitos e tarefas) e pelo Delivery (board Kanban)."
        acoes={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44" aria-label="Filtrar por status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os status</SelectItem>
                {opcoes(STATUS_PROJETO).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {novo}
          </>
        }
      />
      <div className="p-4 md:p-6">
        {projetos.isPending ? (
          <Carregando />
        ) : projetos.isError ? (
          <Erro erro={projetos.error} tentarNovamente={() => projetos.refetch()} />
        ) : projetos.data.length === 0 ? (
          <Vazio
            titulo="Nenhum projeto encontrado"
            descricao="Cadastre um projeto com a ideia e o tema para começar o Discovery."
            acao={novo}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projetos.data.map((p) => (
              <ProjetoCard key={p.id} projeto={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

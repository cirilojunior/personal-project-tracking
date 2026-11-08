"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { StatusProjetoBadge } from "@/components/badges";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { KanbanBoard } from "@/components/delivery/kanban-board";
import { RequisitosSecao } from "@/components/discovery/requisitos-secao";
import { TarefasSecao } from "@/components/discovery/tarefas-secao";
import { Carregando, Erro } from "@/components/estados";
import { PageHeader } from "@/components/page-header";
import { ProjetoDialog } from "@/components/projeto-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { data } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import type { Projeto } from "@/lib/types";

const ABAS = ["visao-geral", "discovery", "delivery"] as const;
type Aba = (typeof ABAS)[number];

function Metrica({ titulo, valor, destaque }: { titulo: string; valor: number; destaque?: boolean }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{titulo}</CardDescription>
        <CardTitle className={`text-2xl tabular-nums ${destaque && valor > 0 ? "text-destructive" : ""}`}>
          {valor}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function VisaoGeral({ projeto: p }: { projeto: Projeto }) {
  const c = p.contagens;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metrica titulo="Requisitos" valor={c.requisitos} />
        <Metrica titulo="Tarefas" valor={c.tarefas} />
        <Metrica titulo="Itens em WIP" valor={c.itensWip} />
        <Metrica titulo="Concluídos" valor={c.itensConcluidos} />
        <Metrica titulo="Impedidos" valor={c.itensImpedidos} destaque />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold">Ideia / descrição</h2>
            <p className="mt-1 max-w-prose text-sm whitespace-pre-line text-muted-foreground">
              {p.descricao ?? "Sem descrição. Edite o projeto para registrar a ideia."}
            </p>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Tema / área de negócio</dt>
              <dd>{p.tema}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Cliente</dt>
              <dd>
                {p.clienteId ? (
                  <Link href={`/clientes/${p.clienteId}`} className="hover:underline">
                    {p.clienteNome}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Início</dt>
              <dd>{data(p.dataInicio)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProjetoDetalhe() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const params = useSearchParams();
  const abaParam = params.get("aba") as Aba | null;
  const aba: Aba = abaParam && ABAS.includes(abaParam) ? abaParam : "discovery";
  const irPara = (a: string) => router.replace(`/projetos/${id}?aba=${a}`, { scroll: false });

  const projeto = useQuery({ queryKey: ["projeto", id], queryFn: () => api.projetos.buscar(id) });
  const excluir = useMutacao(() => api.projetos.excluir(id), {
    sucesso: "Projeto excluído",
    onSuccess: () => router.push("/projetos"),
  });

  if (projeto.isPending) {
    return (
      <div className="p-6">
        <Carregando />
      </div>
    );
  }
  if (projeto.isError) {
    return (
      <div className="p-6">
        <Erro erro={projeto.error} />
      </div>
    );
  }
  const p = projeto.data;

  return (
    <>
      <PageHeader
        antes={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projetos">
              <ChevronLeft /> Projetos
            </Link>
          </Button>
        }
        titulo={
          <span className="flex flex-wrap items-center gap-2">
            {p.nome} <StatusProjetoBadge status={p.status} />
          </span>
        }
        descricao={[p.tema, p.clienteNome].filter(Boolean).join(" · ")}
        acoes={
          <>
            <ProjetoDialog
              projeto={p}
              gatilho={
                <Button variant="outline">
                  <Pencil /> Editar
                </Button>
              }
            />
            <ConfirmarExclusao
              titulo={`Excluir ${p.nome}?`}
              descricao="Requisitos, tarefas e itens de trabalho do projeto serão excluídos permanentemente."
              onConfirmar={() => excluir.mutate()}
            >
              <Button variant="ghost" size="icon" aria-label="Excluir projeto">
                <Trash2 />
              </Button>
            </ConfirmarExclusao>
          </>
        }
      />
      <Tabs value={aba} onValueChange={irPara} className="gap-4 p-4 md:p-6">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral">
          <VisaoGeral projeto={p} />
        </TabsContent>
        <TabsContent value="discovery" className="flex flex-col gap-8">
          <RequisitosSecao projetoId={id} />
          <TarefasSecao projetoId={id} onVerNoBoard={() => irPara("delivery")} />
        </TabsContent>
        <TabsContent value="delivery" className="min-w-0">
          <KanbanBoard projetoId={id} />
        </TabsContent>
      </Tabs>
    </>
  );
}

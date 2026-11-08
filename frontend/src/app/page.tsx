"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Ban, CheckCircle2, Clock, OctagonAlert } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { AgingBadge, StatusProjetoBadge } from "@/components/badges";
import { Carregando, Erro, Vazio } from "@/components/estados";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { api } from "@/lib/api";
import { dias } from "@/lib/format";
import { STATUS_ITEM, STATUS_ITEM_ORDEM } from "@/lib/labels";
import type { Dashboard, ItemResumo } from "@/lib/types";

// Série única (magnitude): um só matiz (#0284c7), validado contra as superfícies clara e escura.
const chartConfig = {
  itens: { label: "Itens", color: "#0284c7" },
} satisfies ChartConfig;

const ABREV: Record<string, string> = {
  SELECIONADO: "Selec.",
  EM_REFINAMENTO: "Refin.",
  REFINADO: "Refinado",
  EM_IMPLEMENTACAO: "Impl.",
  IMPLEMENTADO: "Implem.",
  EM_TESTES: "Testes",
  TESTADO: "Testado",
  AGUARDANDO_PLANEJAMENTO_IMPLANTACAO: "Aguard. impl.",
  CONCLUIDO: "Concluído",
};

function Kpi({ titulo, valor, detalhe }: { titulo: string; valor: number; detalhe?: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{titulo}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{valor}</CardTitle>
        {detalhe && <p className="text-xs text-muted-foreground">{detalhe}</p>}
      </CardHeader>
    </Card>
  );
}

function AgingResumo({ d }: { d: Dashboard }) {
  const faixas = [
    { nivel: "VERDE", rotulo: "Dentro do esperado", Icone: CheckCircle2, cor: "text-emerald-700 dark:text-emerald-400" },
    { nivel: "AMARELO", rotulo: "Atenção", Icone: AlertTriangle, cor: "text-amber-700 dark:text-amber-400" },
    { nivel: "VERMELHO", rotulo: "Crítico", Icone: OctagonAlert, cor: "text-red-700 dark:text-red-400" },
  ] as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging WIP</CardTitle>
        <CardDescription>Itens em andamento por faixa de idade</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {faixas.map(({ nivel, rotulo, Icone, cor }) => (
          <div key={nivel} className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${cor}`}>
              <Icone className="size-3.5" /> {rotulo}
            </span>
            <span className="text-2xl font-semibold tabular-nums">{d.agingPorNivel[nivel]}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ListaItens({ itens, vazio, impedidos }: { itens: ItemResumo[]; vazio: string; impedidos?: boolean }) {
  if (itens.length === 0) return <p className="text-sm text-muted-foreground">{vazio}</p>;
  return (
    <ul className="flex flex-col divide-y">
      {itens.map((i) => (
        <li key={i.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <Link href={`/projetos/${i.projetoId}?aba=delivery`} className="font-medium hover:underline">
              {i.titulo}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {i.projetoNome} · {STATUS_ITEM[i.status]}
            </p>
            {impedidos && i.motivoImpedimento && (
              <p className="mt-1 text-xs text-muted-foreground">“{i.motivoImpedimento}”</p>
            )}
          </div>
          {impedidos ? (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-destructive">
              <Ban className="size-3.5" /> {dias(i.diasImpedido)}
            </span>
          ) : (
            <AgingBadge idade={i.idadeWipDias} nivel={i.nivelAging} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });

  return (
    <>
      <PageHeader titulo="Dashboard" descricao="Visão geral dos seus projetos de consultoria." />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        {dash.isPending ? (
          <Carregando linhas={6} />
        ) : dash.isError ? (
          <Erro erro={dash.error} tentarNovamente={() => dash.refetch()} />
        ) : (
          <Conteudo d={dash.data} />
        )}
      </div>
    </>
  );
}

function Conteudo({ d }: { d: Dashboard }) {
  const t = d.totais;
  const porStatus = STATUS_ITEM_ORDEM.map((s) => ({ status: s, rotulo: ABREV[s], nome: STATUS_ITEM[s], itens: d.itensPorStatus[s] }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi titulo="Projetos" valor={t.projetos} detalhe={`${t.clientes} clientes`} />
        <Kpi
          titulo="Requisitos"
          valor={t.requisitos}
          detalhe={`${d.requisitosPorTipo.FUNCIONAL} RF · ${d.requisitosPorTipo.NAO_FUNCIONAL} RNF`}
        />
        <Kpi titulo="Tarefas (Discovery)" valor={t.tarefas} />
        <Kpi titulo="Itens em WIP" valor={t.itensWip} />
        <Kpi titulo="Concluídos" valor={t.itensConcluidos} />
        <Kpi titulo="Impedidos" valor={t.itensImpedidos} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Itens por coluna do board</CardTitle>
            <CardDescription>Todos os projetos</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
              <BarChart data={porStatus} margin={{ left: -20, right: 4, top: 8 }} barCategoryGap={6}>
                <CartesianGrid vertical={false} strokeOpacity={0.5} />
                <XAxis dataKey="rotulo" tickLine={false} axisLine={false} interval={0} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip
                  cursor={{ fillOpacity: 0.4 }}
                  content={<ChartTooltipContent labelFormatter={(_, p) => p?.[0]?.payload?.nome} />}
                />
                <Bar dataKey="itens" fill="var(--color-itens)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ChartContainer>
            <table className="sr-only">
              <caption>Itens por coluna</caption>
              <tbody>
                {porStatus.map((s) => (
                  <tr key={s.status}>
                    <th>{s.nome}</th>
                    <td>{s.itens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <AgingResumo d={d} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="size-4 text-destructive" /> Itens impedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ListaItens itens={d.impedidos} vazio="Nenhum item impedido. 🎉" impedidos />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" /> Mais antigos em WIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ListaItens itens={d.maisAntigosEmWip} vazio="Nenhum item em andamento." />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          {d.projetos.length === 0 ? (
            <Vazio titulo="Nenhum projeto" descricao="Crie um projeto na página Projetos." />
          ) : (
            <ul className="flex flex-col divide-y">
              {d.projetos.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/projetos/${p.id}`} className="font-medium hover:underline">
                      {p.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.tema}
                      {p.clienteNome && ` · ${p.clienteNome}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{p.contagens.requisitos} req.</span>
                    <span>{p.contagens.itensWip} WIP</span>
                    {p.contagens.itensImpedidos > 0 && (
                      <span className="font-medium text-destructive">{p.contagens.itensImpedidos} impedidos</span>
                    )}
                    <StatusProjetoBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

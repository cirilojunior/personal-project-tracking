import { Ban, ClipboardList, ListChecks, Loader } from "lucide-react";
import Link from "next/link";

import { StatusProjetoBadge } from "@/components/badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Projeto } from "@/lib/types";

export function ProjetoCard({ projeto: p }: { projeto: Projeto }) {
  const c = p.contagens;
  return (
    <Link href={`/projetos/${p.id}`} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full transition-colors group-hover:border-foreground/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="leading-snug">{p.nome}</CardTitle>
            <StatusProjetoBadge status={p.status} />
          </div>
          <CardDescription>
            {p.tema}
            {p.clienteNome && <> · {p.clienteNome}</>}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <dl className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="size-4" />
              <dt className="sr-only">Requisitos</dt>
              <dd>{c.requisitos} requisitos</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <ListChecks className="size-4" />
              <dt className="sr-only">Tarefas</dt>
              <dd>{c.tarefas} tarefas</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Loader className="size-4" />
              <dt className="sr-only">Em andamento</dt>
              <dd>{c.itensWip} em WIP</dd>
            </div>
            <div className={`flex items-center gap-1.5 ${c.itensImpedidos ? "font-medium text-destructive" : ""}`}>
              <Ban className="size-4" />
              <dt className="sr-only">Impedidos</dt>
              <dd>{c.itensImpedidos} impedidos</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}

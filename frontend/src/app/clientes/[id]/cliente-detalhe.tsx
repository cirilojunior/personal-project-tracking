"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Mail, Pencil, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ClienteDialog } from "@/components/cliente-dialog";
import { Carregando, Erro, Vazio } from "@/components/estados";
import { PageHeader } from "@/components/page-header";
import { ProjetoCard } from "@/components/projeto-card";
import { ProjetoDialog } from "@/components/projeto-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function ClienteDetalhe() {
  const id = Number(useParams<{ id: string }>().id);
  const cliente = useQuery({ queryKey: ["cliente", id], queryFn: () => api.clientes.buscar(id) });
  const projetos = useQuery({
    queryKey: ["projetos", { clienteId: id }],
    queryFn: () => api.projetos.listar({ clienteId: id }),
  });

  if (cliente.isPending) {
    return (
      <div className="p-6">
        <Carregando />
      </div>
    );
  }
  if (cliente.isError) {
    return (
      <div className="p-6">
        <Erro erro={cliente.error} />
      </div>
    );
  }
  const c = cliente.data;

  return (
    <>
      <PageHeader
        antes={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clientes">
              <ChevronLeft /> Clientes
            </Link>
          </Button>
        }
        titulo={c.nome}
        descricao={c.empresa ?? undefined}
        acoes={
          <>
            <ClienteDialog
              cliente={c}
              gatilho={
                <Button variant="outline">
                  <Pencil /> Editar
                </Button>
              }
            />
            <ProjetoDialog
              clienteId={c.id}
              gatilho={
                <Button>
                  <Plus /> Novo projeto
                </Button>
              }
            />
          </>
        }
      />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {c.email && (
            <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Mail className="size-4" /> {c.email}
            </a>
          )}
          {c.telefone && (
            <span className="flex items-center gap-1.5">
              <Phone className="size-4" /> {c.telefone}
            </span>
          )}
        </div>
        {c.observacoes && <p className="max-w-prose whitespace-pre-line text-sm">{c.observacoes}</p>}

        <section className="flex flex-col gap-3">
          <h2 className="font-semibold">Projetos</h2>
          {projetos.isPending ? (
            <Carregando linhas={2} />
          ) : projetos.isError ? (
            <Erro erro={projetos.error} />
          ) : projetos.data.length === 0 ? (
            <Vazio titulo="Nenhum projeto para este cliente" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projetos.data.map((p) => (
                <ProjetoCard key={p.id} projeto={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

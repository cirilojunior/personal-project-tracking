"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { ClienteDialog } from "@/components/cliente-dialog";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Carregando, Erro, Vazio } from "@/components/estados";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useMutacao } from "@/lib/hooks";

export default function ClientesPage() {
  const clientes = useQuery({ queryKey: ["clientes"], queryFn: api.clientes.listar });
  const excluir = useMutacao((id: number) => api.clientes.excluir(id), { sucesso: "Cliente excluído" });

  const novo = (
    <ClienteDialog
      gatilho={
        <Button>
          <Plus /> Novo cliente
        </Button>
      }
    />
  );

  return (
    <>
      <PageHeader titulo="Clientes" descricao="Pessoas e empresas para quem você presta consultoria." acoes={novo} />
      <div className="p-4 md:p-6">
        {clientes.isPending ? (
          <Carregando />
        ) : clientes.isError ? (
          <Erro erro={clientes.error} tentarNovamente={() => clientes.refetch()} />
        ) : clientes.data.length === 0 ? (
          <Vazio titulo="Nenhum cliente cadastrado" descricao="Cadastre seu primeiro cliente." acao={novo} />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="hidden md:table-cell">E-mail</TableHead>
                  <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                  <TableHead className="text-right">Projetos</TableHead>
                  <TableHead className="w-24">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clientes/${c.id}`} className="hover:underline">
                        {c.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{c.empresa ?? "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.email ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{c.telefone ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.totalProjetos}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ClienteDialog
                          cliente={c}
                          gatilho={
                            <Button variant="ghost" size="icon-sm" aria-label={`Editar ${c.nome}`}>
                              <Pencil />
                            </Button>
                          }
                        />
                        <ConfirmarExclusao
                          titulo={`Excluir ${c.nome}?`}
                          descricao="Os projetos do cliente serão mantidos, mas ficarão sem cliente associado."
                          onConfirmar={() => excluir.mutate(c.id)}
                        >
                          <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${c.nome}`}>
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
      </div>
    </>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CampoSelect, CampoTexto, CampoTextoLongo, NENHUM } from "@/components/campos";
import { FormDialog } from "@/components/form-dialog";
import { api } from "@/lib/api";
import { vazioParaNull } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import { opcoes, STATUS_PROJETO } from "@/lib/labels";
import type { Projeto, ProjetoInput, StatusProjeto } from "@/lib/types";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(150, "Máximo de 150 caracteres"),
  tema: z.string().trim().min(1, "Tema/área de negócio é obrigatório").max(150, "Máximo de 150 caracteres"),
  descricao: z.string().max(4000, "Máximo de 4000 caracteres"),
  clienteId: z.string(),
  status: z.string(),
  dataInicio: z.string(),
});
type Valores = z.infer<typeof schema>;

const valores = (p?: Projeto, clienteId?: number): Valores => ({
  nome: p?.nome ?? "",
  tema: p?.tema ?? "",
  descricao: p?.descricao ?? "",
  clienteId: String(p?.clienteId ?? clienteId ?? NENHUM),
  status: p?.status ?? "DISCOVERY",
  dataInicio: p?.dataInicio ?? "",
});

export function ProjetoDialog({
  projeto,
  clienteId,
  gatilho,
}: {
  projeto?: Projeto;
  clienteId?: number;
  gatilho: React.ReactNode;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const form = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: valores(projeto, clienteId) });
  const clientes = useQuery({ queryKey: ["clientes"], queryFn: api.clientes.listar, enabled: aberto });

  useEffect(() => {
    if (aberto) form.reset(valores(projeto, clienteId));
  }, [aberto, projeto, clienteId, form]);

  const salvar = useMutacao(
    (v: ProjetoInput) => (projeto ? api.projetos.atualizar(projeto.id, v) : api.projetos.criar(v)),
    {
      sucesso: projeto ? "Projeto atualizado" : "Projeto criado",
      onSuccess: (p) => {
        setAberto(false);
        if (!projeto) router.push(`/projetos/${p.id}`);
      },
    },
  );

  const onSubmit = form.handleSubmit((v) =>
    salvar.mutate({
      nome: v.nome.trim(),
      tema: v.tema.trim(),
      descricao: vazioParaNull(v.descricao),
      clienteId: v.clienteId === NENHUM ? null : Number(v.clienteId),
      status: v.status as StatusProjeto,
      dataInicio: vazioParaNull(v.dataInicio),
    }),
  );

  const opcoesClientes = [
    { value: NENHUM, label: "Sem cliente" },
    ...(clientes.data ?? []).map((c) => ({
      value: String(c.id),
      label: c.empresa ? `${c.nome} (${c.empresa})` : c.nome,
    })),
  ];

  return (
    <FormDialog
      aberto={aberto}
      onAberto={setAberto}
      gatilho={gatilho}
      titulo={projeto ? "Editar projeto" : "Novo projeto"}
      descricao="Cadastre a ideia do projeto para iniciar a etapa de Discovery."
      onSubmit={onSubmit}
      salvando={salvar.isPending}
    >
      <CampoTexto control={form.control} name="nome" label="Nome" autoFocus />
      <CampoTexto
        control={form.control}
        name="tema"
        label="Tema / área de negócio"
        placeholder="Ex.: Logística, Varejo, Saúde…"
      />
      <CampoTextoLongo
        control={form.control}
        name="descricao"
        label="Ideia / descrição"
        placeholder="Qual problema o projeto resolve?"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect control={form.control} name="clienteId" label="Cliente" opcoes={opcoesClientes} />
        <CampoSelect control={form.control} name="status" label="Status" opcoes={opcoes(STATUS_PROJETO)} />
      </div>
      <CampoTexto control={form.control} name="dataInicio" label="Data de início" type="date" />
    </FormDialog>
  );
}

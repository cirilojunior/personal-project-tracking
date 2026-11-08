"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CampoTexto, CampoTextoLongo } from "@/components/campos";
import { FormDialog } from "@/components/form-dialog";
import { api } from "@/lib/api";
import { vazioParaNull } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import type { Cliente, ClienteInput } from "@/lib/types";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(150, "Máximo de 150 caracteres"),
  empresa: z.string().max(150, "Máximo de 150 caracteres"),
  email: z.union([z.literal(""), z.email("E-mail inválido")]),
  telefone: z.string().max(40, "Máximo de 40 caracteres"),
  observacoes: z.string().max(4000, "Máximo de 4000 caracteres"),
});
type Valores = z.infer<typeof schema>;

const valores = (c?: Cliente): Valores => ({
  nome: c?.nome ?? "",
  empresa: c?.empresa ?? "",
  email: c?.email ?? "",
  telefone: c?.telefone ?? "",
  observacoes: c?.observacoes ?? "",
});

export function ClienteDialog({ cliente, gatilho }: { cliente?: Cliente; gatilho: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const form = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: valores(cliente) });

  useEffect(() => {
    if (aberto) form.reset(valores(cliente));
  }, [aberto, cliente, form]);

  const salvar = useMutacao(
    (v: ClienteInput) => (cliente ? api.clientes.atualizar(cliente.id, v) : api.clientes.criar(v)),
    { sucesso: cliente ? "Cliente atualizado" : "Cliente cadastrado", onSuccess: () => setAberto(false) },
  );

  const onSubmit = form.handleSubmit((v) =>
    salvar.mutate({
      nome: v.nome.trim(),
      empresa: vazioParaNull(v.empresa),
      email: vazioParaNull(v.email),
      telefone: vazioParaNull(v.telefone),
      observacoes: vazioParaNull(v.observacoes),
    }),
  );

  return (
    <FormDialog
      aberto={aberto}
      onAberto={setAberto}
      gatilho={gatilho}
      titulo={cliente ? "Editar cliente" : "Novo cliente"}
      onSubmit={onSubmit}
      salvando={salvar.isPending}
    >
      <CampoTexto control={form.control} name="nome" label="Nome" autoFocus />
      <CampoTexto control={form.control} name="empresa" label="Empresa" />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto control={form.control} name="email" label="E-mail" type="email" />
        <CampoTexto control={form.control} name="telefone" label="Telefone" />
      </div>
      <CampoTextoLongo control={form.control} name="observacoes" label="Observações" />
    </FormDialog>
  );
}

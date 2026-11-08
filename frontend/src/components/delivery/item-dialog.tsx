"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/campos";
import { FormDialog } from "@/components/form-dialog";
import { api } from "@/lib/api";
import { vazioParaNull } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import { opcoes, PRIORIDADE } from "@/lib/labels";
import type { ItemDetalhe, ItemInput, Prioridade } from "@/lib/types";

const schema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório").max(200, "Máximo de 200 caracteres"),
  descricao: z.string().max(4000, "Máximo de 4000 caracteres"),
  prioridade: z.string(),
});
type Valores = z.infer<typeof schema>;

const valores = (i?: ItemDetalhe): Valores => ({
  titulo: i?.titulo ?? "",
  descricao: i?.descricao ?? "",
  prioridade: i?.prioridade ?? "MEDIA",
});

export function ItemDialog({
  projetoId,
  item,
  gatilho,
}: {
  projetoId: number;
  item?: ItemDetalhe;
  gatilho: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const form = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: valores(item) });

  useEffect(() => {
    if (aberto) form.reset(valores(item));
  }, [aberto, item, form]);

  const salvar = useMutacao(
    (v: ItemInput) => (item ? api.itens.atualizar(item.id, v) : api.itens.criar(projetoId, v)),
    { sucesso: item ? "Item atualizado" : "Item criado em Selecionado", onSuccess: () => setAberto(false) },
  );

  const onSubmit = form.handleSubmit((v) =>
    salvar.mutate({
      titulo: v.titulo.trim(),
      descricao: vazioParaNull(v.descricao),
      prioridade: v.prioridade as Prioridade,
    }),
  );

  return (
    <FormDialog
      aberto={aberto}
      onAberto={setAberto}
      gatilho={gatilho}
      titulo={item ? "Editar item de trabalho" : "Novo item de trabalho"}
      onSubmit={onSubmit}
      salvando={salvar.isPending}
    >
      <CampoTexto control={form.control} name="titulo" label="Título" autoFocus />
      <CampoTextoLongo control={form.control} name="descricao" label="Descrição" />
      <CampoSelect control={form.control} name="prioridade" label="Prioridade" opcoes={opcoes(PRIORIDADE)} />
    </FormDialog>
  );
}

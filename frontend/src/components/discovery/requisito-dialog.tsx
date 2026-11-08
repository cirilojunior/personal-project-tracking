"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { CampoSelect, CampoTexto, CampoTextoLongo, NENHUM } from "@/components/campos";
import { FormDialog } from "@/components/form-dialog";
import { api } from "@/lib/api";
import { vazioParaNull } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import { CATEGORIA_NFR, MOSCOW, opcoes, STATUS_REQUISITO, TIPO_REQUISITO } from "@/lib/labels";
import type {
  CategoriaNfr,
  PrioridadeMoscow,
  Requisito,
  RequisitoInput,
  StatusRequisito,
  TipoRequisito,
} from "@/lib/types";

const schema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório").max(200, "Máximo de 200 caracteres"),
  descricao: z.string().max(4000, "Máximo de 4000 caracteres"),
  tipo: z.string(),
  categoriaNfr: z.string(),
  prioridade: z.string(),
  status: z.string(),
});
type Valores = z.infer<typeof schema>;

const valores = (r?: Requisito): Valores => ({
  titulo: r?.titulo ?? "",
  descricao: r?.descricao ?? "",
  tipo: r?.tipo ?? "FUNCIONAL",
  categoriaNfr: r?.categoriaNfr ?? NENHUM,
  prioridade: r?.prioridade ?? "SHOULD",
  status: r?.status ?? "RASCUNHO",
});

export function RequisitoDialog({
  projetoId,
  requisito,
  gatilho,
}: {
  projetoId: number;
  requisito?: Requisito;
  gatilho: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const form = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: valores(requisito) });
  const tipo = useWatch({ control: form.control, name: "tipo" });

  useEffect(() => {
    if (aberto) form.reset(valores(requisito));
  }, [aberto, requisito, form]);

  const salvar = useMutacao(
    (v: RequisitoInput) =>
      requisito ? api.requisitos.atualizar(requisito.id, v) : api.requisitos.criar(projetoId, v),
    {
      sucesso: (r) => (requisito ? `Requisito ${r.codigo} atualizado` : `Requisito ${r.codigo} criado`),
      onSuccess: () => setAberto(false),
    },
  );

  const onSubmit = form.handleSubmit((v) =>
    salvar.mutate({
      titulo: v.titulo.trim(),
      descricao: vazioParaNull(v.descricao),
      tipo: v.tipo as TipoRequisito,
      categoriaNfr: v.tipo === "NAO_FUNCIONAL" && v.categoriaNfr !== NENHUM ? (v.categoriaNfr as CategoriaNfr) : null,
      prioridade: v.prioridade as PrioridadeMoscow,
      status: v.status as StatusRequisito,
    }),
  );

  return (
    <FormDialog
      aberto={aberto}
      onAberto={setAberto}
      gatilho={gatilho}
      titulo={requisito ? `Editar ${requisito.codigo}` : "Novo requisito"}
      descricao="Registre o que o cliente precisa (funcional) ou como o sistema deve se comportar (não funcional)."
      onSubmit={onSubmit}
      salvando={salvar.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect control={form.control} name="tipo" label="Tipo" opcoes={opcoes(TIPO_REQUISITO)} />
        <CampoSelect
          control={form.control}
          name="categoriaNfr"
          label="Categoria (não funcional)"
          disabled={tipo !== "NAO_FUNCIONAL"}
          opcoes={[{ value: NENHUM, label: "Não informada" }, ...opcoes(CATEGORIA_NFR)]}
        />
      </div>
      <CampoTexto control={form.control} name="titulo" label="Título" autoFocus />
      <CampoTextoLongo
        control={form.control}
        name="descricao"
        label="Descrição"
        placeholder="Detalhes, regras, critérios de aceite…"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect control={form.control} name="prioridade" label="Prioridade (MoSCoW)" opcoes={opcoes(MOSCOW)} />
        <CampoSelect control={form.control} name="status" label="Status" opcoes={opcoes(STATUS_REQUISITO)} />
      </div>
    </FormDialog>
  );
}

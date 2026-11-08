"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/campos";
import { FormDialog } from "@/components/form-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { api } from "@/lib/api";
import { vazioParaNull } from "@/lib/format";
import { useMutacao } from "@/lib/hooks";
import { opcoes, PRIORIDADE, STATUS_TAREFA } from "@/lib/labels";
import type { Prioridade, StatusTarefa, Tarefa, TarefaInput } from "@/lib/types";

const schema = z.object({
  titulo: z.string().trim().min(1, "Título é obrigatório").max(200, "Máximo de 200 caracteres"),
  descricao: z.string().max(4000, "Máximo de 4000 caracteres"),
  prioridade: z.string(),
  status: z.string(),
  requisitoIds: z.array(z.number()),
});
type Valores = z.infer<typeof schema>;

const valores = (t?: Tarefa): Valores => ({
  titulo: t?.titulo ?? "",
  descricao: t?.descricao ?? "",
  prioridade: t?.prioridade ?? "MEDIA",
  status: t?.status ?? "A_FAZER",
  requisitoIds: t?.requisitos.map((r) => r.id) ?? [],
});

export function TarefaDialog({
  projetoId,
  tarefa,
  gatilho,
}: {
  projetoId: number;
  tarefa?: Tarefa;
  gatilho: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const form = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: valores(tarefa) });
  const requisitos = useQuery({
    queryKey: ["requisitos", projetoId],
    queryFn: () => api.requisitos.listar(projetoId),
    enabled: aberto,
  });

  useEffect(() => {
    if (aberto) form.reset(valores(tarefa));
  }, [aberto, tarefa, form]);

  const salvar = useMutacao(
    (v: TarefaInput) => (tarefa ? api.tarefas.atualizar(tarefa.id, v) : api.tarefas.criar(projetoId, v)),
    { sucesso: tarefa ? "Tarefa atualizada" : "Tarefa criada", onSuccess: () => setAberto(false) },
  );

  const onSubmit = form.handleSubmit((v) =>
    salvar.mutate({
      titulo: v.titulo.trim(),
      descricao: vazioParaNull(v.descricao),
      prioridade: v.prioridade as Prioridade,
      status: v.status as StatusTarefa,
      requisitoIds: v.requisitoIds,
    }),
  );

  const lista = (requisitos.data ?? []).filter((r) => r.status !== "DESCARTADO" || valores(tarefa).requisitoIds.includes(r.id));

  return (
    <FormDialog
      aberto={aberto}
      onAberto={setAberto}
      gatilho={gatilho}
      titulo={tarefa ? "Editar tarefa" : "Nova tarefa"}
      descricao="Tarefas de alto nível do Discovery. Depois você pode enviá-las ao board de Delivery."
      onSubmit={onSubmit}
      salvando={salvar.isPending}
    >
      <CampoTexto control={form.control} name="titulo" label="Título" autoFocus />
      <CampoTextoLongo control={form.control} name="descricao" label="Descrição" />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect control={form.control} name="prioridade" label="Prioridade" opcoes={opcoes(PRIORIDADE)} />
        <CampoSelect control={form.control} name="status" label="Status" opcoes={opcoes(STATUS_TAREFA)} />
      </div>
      <Controller
        control={form.control}
        name="requisitoIds"
        render={({ field }) => (
          <FieldSet>
            <FieldLegend variant="label">Requisitos relacionados</FieldLegend>
            {lista.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {requisitos.isPending ? "Carregando…" : "Nenhum requisito cadastrado neste projeto."}
              </p>
            ) : (
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                {lista.map((r) => {
                  const marcado = field.value.includes(r.id);
                  return (
                    <Field key={r.id} orientation="horizontal">
                      <Checkbox
                        id={`req-${r.id}`}
                        checked={marcado}
                        onCheckedChange={(v) =>
                          field.onChange(v ? [...field.value, r.id] : field.value.filter((x) => x !== r.id))
                        }
                      />
                      <FieldLabel htmlFor={`req-${r.id}`} className="font-normal">
                        <span className="font-mono text-xs">{r.codigo}</span> {r.titulo}
                      </FieldLabel>
                    </Field>
                  );
                })}
              </div>
            )}
          </FieldSet>
        )}
      />
    </FormDialog>
  );
}

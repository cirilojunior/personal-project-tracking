"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "./api";

/**
 * Mutação com feedback (toast) que, ao concluir, invalida todas as consultas — os volumes são
 * pequenos, então recarregar tudo mantém board, contagens e dashboard sempre coerentes.
 */
export function useMutacao<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  opts: { sucesso?: string | ((r: TResult) => string); onSuccess?: (r: TResult) => void } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      if (opts.sucesso) toast.success(typeof opts.sucesso === "function" ? opts.sucesso(r) : opts.sucesso);
      opts.onSuccess?.(r);
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Não foi possível concluir a operação"),
    onSettled: () => qc.invalidateQueries(),
  });
}

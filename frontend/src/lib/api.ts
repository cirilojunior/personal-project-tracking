import type {
  Board,
  Cliente,
  ClienteInput,
  Dashboard,
  ItemDetalhe,
  ItemInput,
  Projeto,
  ProjetoInput,
  Requisito,
  RequisitoInput,
  StatusItem,
  StatusProjeto,
  Tarefa,
  TarefaInput,
} from "./types";

/** Erro da API (corpo ProblemDetail do Spring). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public erros?: Record<string, string>,
  ) {
    super(message);
  }
}

// Chamadas vão para /api/* e o Next.js faz proxy para o Spring Boot (ver next.config.ts).
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    let detalhe: string | undefined;
    let erros: Record<string, string> | undefined;
    try {
      const body = await res.json();
      detalhe = body.detail ?? body.title;
      erros = body.erros;
    } catch {
      // corpo vazio ou não-JSON (ex.: proxy sem backend no ar)
    }
    if (!detalhe) {
      detalhe = res.status >= 500 ? "API indisponível. O backend está rodando?" : `Erro ${res.status}`;
    }
    throw new ApiError(res.status, detalhe, erros);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

function query(params: Record<string, string | number | null | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") qs.set(k, String(v));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const api = {
  dashboard: () => request<Dashboard>("/dashboard"),

  clientes: {
    listar: () => request<Cliente[]>("/clientes"),
    buscar: (id: number) => request<Cliente>(`/clientes/${id}`),
    criar: (c: ClienteInput) => request<Cliente>("/clientes", json("POST", c)),
    atualizar: (id: number, c: ClienteInput) => request<Cliente>(`/clientes/${id}`, json("PUT", c)),
    excluir: (id: number) => request<void>(`/clientes/${id}`, json("DELETE")),
  },

  projetos: {
    listar: (f: { status?: StatusProjeto; clienteId?: number } = {}) =>
      request<Projeto[]>(`/projetos${query(f)}`),
    buscar: (id: number) => request<Projeto>(`/projetos/${id}`),
    criar: (p: ProjetoInput) => request<Projeto>("/projetos", json("POST", p)),
    atualizar: (id: number, p: ProjetoInput) => request<Projeto>(`/projetos/${id}`, json("PUT", p)),
    excluir: (id: number) => request<void>(`/projetos/${id}`, json("DELETE")),
  },

  requisitos: {
    listar: (projetoId: number) => request<Requisito[]>(`/projetos/${projetoId}/requisitos`),
    criar: (projetoId: number, r: RequisitoInput) =>
      request<Requisito>(`/projetos/${projetoId}/requisitos`, json("POST", r)),
    atualizar: (id: number, r: RequisitoInput) => request<Requisito>(`/requisitos/${id}`, json("PUT", r)),
    excluir: (id: number) => request<void>(`/requisitos/${id}`, json("DELETE")),
  },

  tarefas: {
    listar: (projetoId: number) => request<Tarefa[]>(`/projetos/${projetoId}/tarefas`),
    criar: (projetoId: number, t: TarefaInput) =>
      request<Tarefa>(`/projetos/${projetoId}/tarefas`, json("POST", t)),
    atualizar: (id: number, t: TarefaInput) => request<Tarefa>(`/tarefas/${id}`, json("PUT", t)),
    excluir: (id: number) => request<void>(`/tarefas/${id}`, json("DELETE")),
    enviarParaDelivery: (id: number) => request<ItemDetalhe>(`/tarefas/${id}/enviar-para-delivery`, json("POST")),
  },

  board: (projetoId?: number | null) =>
    request<Board>(projetoId ? `/projetos/${projetoId}/board` : "/board"),

  itens: {
    buscar: (id: number) => request<ItemDetalhe>(`/itens/${id}`),
    criar: (projetoId: number, i: ItemInput) =>
      request<ItemDetalhe>(`/projetos/${projetoId}/itens`, json("POST", i)),
    atualizar: (id: number, i: ItemInput) => request<ItemDetalhe>(`/itens/${id}`, json("PUT", i)),
    excluir: (id: number) => request<void>(`/itens/${id}`, json("DELETE")),
    mover: (id: number, status: StatusItem, ordem: number) =>
      request<ItemDetalhe>(`/itens/${id}/mover`, json("POST", { status, ordem })),
    impedir: (id: number, motivo: string) =>
      request<ItemDetalhe>(`/itens/${id}/impedimento`, json("PUT", { motivo })),
    desimpedir: (id: number) => request<ItemDetalhe>(`/itens/${id}/impedimento`, json("DELETE")),
    adicionarSubtarefa: (id: number, titulo: string) =>
      request<ItemDetalhe>(`/itens/${id}/subtarefas`, json("POST", { titulo })),
    atualizarSubtarefa: (id: number, subId: number, titulo: string, concluida: boolean) =>
      request<ItemDetalhe>(`/itens/${id}/subtarefas/${subId}`, json("PUT", { titulo, concluida })),
    excluirSubtarefa: (id: number, subId: number) =>
      request<ItemDetalhe>(`/itens/${id}/subtarefas/${subId}`, json("DELETE")),
  },
};

// Tipos espelhando os DTOs da API Spring Boot (backend/src/main/java/br/com/clxj/tracker).

export type Prioridade = "ALTA" | "MEDIA" | "BAIXA";
export type StatusProjeto = "DISCOVERY" | "EM_ANDAMENTO" | "PAUSADO" | "CONCLUIDO";
export type TipoRequisito = "FUNCIONAL" | "NAO_FUNCIONAL";
export type CategoriaNfr =
  | "DESEMPENHO"
  | "SEGURANCA"
  | "USABILIDADE"
  | "DISPONIBILIDADE"
  | "ESCALABILIDADE"
  | "MANUTENIBILIDADE"
  | "COMPATIBILIDADE"
  | "CONFORMIDADE"
  | "OUTRA";
export type PrioridadeMoscow = "MUST" | "SHOULD" | "COULD" | "WONT";
export type StatusRequisito = "RASCUNHO" | "VALIDADO" | "APROVADO" | "DESCARTADO";
export type StatusTarefa = "A_FAZER" | "EM_ANDAMENTO" | "CONCLUIDA";
export type StatusItem =
  | "SELECIONADO"
  | "EM_REFINAMENTO"
  | "REFINADO"
  | "EM_IMPLEMENTACAO"
  | "IMPLEMENTADO"
  | "EM_TESTES"
  | "TESTADO"
  | "AGUARDANDO_PLANEJAMENTO_IMPLANTACAO"
  | "CONCLUIDO";
export type NivelAging = "VERDE" | "AMARELO" | "VERMELHO";

export interface Cliente {
  id: number;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  observacoes: string | null;
  criadoEm: string;
  totalProjetos: number;
}

export type ClienteInput = Omit<Cliente, "id" | "criadoEm" | "totalProjetos">;

export interface Projeto {
  id: number;
  nome: string;
  tema: string;
  descricao: string | null;
  clienteId: number | null;
  clienteNome: string | null;
  status: StatusProjeto;
  dataInicio: string | null;
  criadoEm: string;
  contagens: {
    requisitos: number;
    tarefas: number;
    itensWip: number;
    itensConcluidos: number;
    itensImpedidos: number;
  };
}

export interface ProjetoInput {
  nome: string;
  tema: string;
  descricao: string | null;
  clienteId: number | null;
  status: StatusProjeto;
  dataInicio: string | null;
}

export interface Requisito {
  id: number;
  projetoId: number;
  codigo: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoRequisito;
  categoriaNfr: CategoriaNfr | null;
  prioridade: PrioridadeMoscow;
  status: StatusRequisito;
  criadoEm: string;
}

export interface RequisitoInput {
  titulo: string;
  descricao: string | null;
  tipo: TipoRequisito;
  categoriaNfr: CategoriaNfr | null;
  prioridade: PrioridadeMoscow;
  status: StatusRequisito;
}

export interface Tarefa {
  id: number;
  projetoId: number;
  titulo: string;
  descricao: string | null;
  prioridade: Prioridade;
  status: StatusTarefa;
  requisitos: { id: number; codigo: string; titulo: string }[];
  itemTrabalho: { id: number; status: StatusItem } | null;
  criadoEm: string;
}

export interface TarefaInput {
  titulo: string;
  descricao: string | null;
  prioridade: Prioridade;
  status: StatusTarefa;
  requisitoIds: number[];
}

export interface ItemResumo {
  id: number;
  projetoId: number;
  projetoNome: string;
  titulo: string;
  prioridade: Prioridade;
  status: StatusItem;
  ordem: number;
  impedido: boolean;
  motivoImpedimento: string | null;
  diasImpedido: number | null;
  idadeWipDias: number | null;
  nivelAging: NivelAging | null;
  diasNoStatus: number;
  subtarefasTotal: number;
  subtarefasConcluidas: number;
  tarefaOrigemId: number | null;
}

export interface Subtarefa {
  id: number;
  titulo: string;
  concluida: boolean;
  ordem: number;
}

export interface ItemDetalhe extends Omit<ItemResumo, "subtarefasTotal" | "subtarefasConcluidas"> {
  descricao: string | null;
  impedidoDesde: string | null;
  inicioWip: string | null;
  concluidoEm: string | null;
  statusDesde: string;
  criadoEm: string;
  subtarefas: Subtarefa[];
  historico: { statusAnterior: StatusItem | null; statusNovo: StatusItem; ocorridoEm: string }[];
}

export interface ItemInput {
  titulo: string;
  descricao: string | null;
  prioridade: Prioridade;
}

export interface Coluna {
  status: StatusItem;
  total: number;
  impedidos: number;
  itens: ItemResumo[];
}

export interface Board {
  projetoId: number | null;
  limitesAging: { limiteAtencaoDias: number; limiteCriticoDias: number };
  colunas: Coluna[];
}

export interface Dashboard {
  totais: {
    clientes: number;
    projetos: number;
    requisitos: number;
    tarefas: number;
    itensWip: number;
    itensConcluidos: number;
    itensImpedidos: number;
  };
  projetosPorStatus: Record<StatusProjeto, number>;
  requisitosPorTipo: Record<TipoRequisito, number>;
  requisitosPorStatus: Record<StatusRequisito, number>;
  itensPorStatus: Record<StatusItem, number>;
  agingPorNivel: Record<NivelAging, number>;
  impedidos: ItemResumo[];
  maisAntigosEmWip: ItemResumo[];
  projetos: Projeto[];
}

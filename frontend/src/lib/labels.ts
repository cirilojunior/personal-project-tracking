import type {
  CategoriaNfr,
  NivelAging,
  Prioridade,
  PrioridadeMoscow,
  StatusItem,
  StatusProjeto,
  StatusRequisito,
  StatusTarefa,
  TipoRequisito,
} from "./types";

export const PRIORIDADE: Record<Prioridade, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

export const STATUS_PROJETO: Record<StatusProjeto, string> = {
  DISCOVERY: "Discovery",
  EM_ANDAMENTO: "Em andamento",
  PAUSADO: "Pausado",
  CONCLUIDO: "Concluído",
};

export const TIPO_REQUISITO: Record<TipoRequisito, string> = {
  FUNCIONAL: "Funcional",
  NAO_FUNCIONAL: "Não funcional",
};

export const CATEGORIA_NFR: Record<CategoriaNfr, string> = {
  DESEMPENHO: "Desempenho",
  SEGURANCA: "Segurança",
  USABILIDADE: "Usabilidade",
  DISPONIBILIDADE: "Disponibilidade",
  ESCALABILIDADE: "Escalabilidade",
  MANUTENIBILIDADE: "Manutenibilidade",
  COMPATIBILIDADE: "Compatibilidade",
  CONFORMIDADE: "Conformidade",
  OUTRA: "Outra",
};

export const MOSCOW: Record<PrioridadeMoscow, string> = {
  MUST: "Must have",
  SHOULD: "Should have",
  COULD: "Could have",
  WONT: "Won't have",
};

export const STATUS_REQUISITO: Record<StatusRequisito, string> = {
  RASCUNHO: "Rascunho",
  VALIDADO: "Validado",
  APROVADO: "Aprovado",
  DESCARTADO: "Descartado",
};

export const STATUS_TAREFA: Record<StatusTarefa, string> = {
  A_FAZER: "A fazer",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

export const STATUS_ITEM: Record<StatusItem, string> = {
  SELECIONADO: "Selecionado",
  EM_REFINAMENTO: "Em refinamento",
  REFINADO: "Refinado",
  EM_IMPLEMENTACAO: "Em implementação",
  IMPLEMENTADO: "Implementado",
  EM_TESTES: "Em testes",
  TESTADO: "Testado",
  AGUARDANDO_PLANEJAMENTO_IMPLANTACAO: "Aguardando planejamento de implantação",
  CONCLUIDO: "Concluído",
};

export const STATUS_ITEM_ORDEM = Object.keys(STATUS_ITEM) as StatusItem[];

export const NIVEL_AGING: Record<NivelAging, string> = {
  VERDE: "Dentro do esperado",
  AMARELO: "Atenção",
  VERMELHO: "Crítico",
};

export function opcoes<K extends string>(mapa: Record<K, string>) {
  return (Object.entries(mapa) as [K, string][]).map(([value, label]) => ({ value, label }));
}

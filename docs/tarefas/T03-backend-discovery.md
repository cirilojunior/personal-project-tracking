# T03 — Backend: Discovery

**Status:** Concluída · **Labels:** `enhancement`, `backend` · **Fase do plano:** 3

**Issue:** [#3](https://github.com/cirilojunior/personal-project-tracking/issues/3)

## Escopo
- `Requisito`: código gerado (RF-001 / RNF-001), tipo, categoria de NFR, prioridade MoSCoW, status (`RASCUNHO`, `VALIDADO`, `APROVADO`, `DESCARTADO`).
- `TarefaDiscovery`: prioridade, status (`A_FAZER`, `EM_ANDAMENTO`, `CONCLUIDA`), requisitos relacionados (N:N).
- Endpoints `/api/projetos/{id}/requisitos` e `/api/projetos/{id}/tarefas`, com filtros por tipo/status/prioridade.
- `POST /api/tarefas/{id}/enviar-para-delivery`: cria item em *Selecionado*, uma vez por tarefa, e marca a tarefa como *Em andamento*.

## Critérios de aceite
- [x] Códigos RF/RNF sequenciais por projeto.
- [x] Enviar a mesma tarefa duas vezes é rejeitado com erro de regra de negócio.
- [x] Testes de integração cobrindo o fluxo.

## Referências
Commit `b61fceb`; RF-03, RF-04, RF-05.

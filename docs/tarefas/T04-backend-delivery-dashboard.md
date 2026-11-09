# T04 — Backend: Delivery e Dashboard

**Status:** Concluída · **Labels:** `enhancement`, `backend` · **Fase do plano:** 4

## Escopo
- `ItemTrabalho`, `SubTarefa` e `HistoricoStatus`; 9 status do fluxo.
- `delivery/WorkflowService` (com `Clock` injetado) concentrando regras de transição, impedimento e aging.
- Endpoints: board por projeto (itens agrupados por status, com idade), CRUD de itens, `mover` (status + ordem), `impedimento` (PUT/DELETE), subtarefas.
- Aging: `inicioWip` na primeira saída de *Selecionado*; para em *Concluído*; faixas configuráveis em `tracker.aging.*`.
- Impedimento: guarda motivo e data; atualizar o motivo mantém a data; concluir remove o impedimento; item concluído não pode ser impedido.
- `/api/dashboard`: totais, itens por coluna, faixas de aging, impedidos, itens mais antigos.
- Testes: `WorkflowServiceTest` (unitário) e `ApiFluxoCompletoTest` (integração, perfil `test`).

## Critérios de aceite
- [x] Histórico gravado a cada mudança de status.
- [x] Regras de aging e impedimento cobertas por testes.
- [x] `./mvnw verify` com 10 testes passando.

## Referências
Commit `b61fceb`; RF-06 a RF-09, RF-11, RNF-04.

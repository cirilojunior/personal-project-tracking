# T07 — Frontend: Delivery (board Kanban)

**Status:** Concluída (arrastar e soltar sem validação manual — ver T09) · **Labels:** `enhancement`, `frontend` · **Fase do plano:** 7

**Issue:** [#7](https://github.com/cirilojunior/personal-project-tracking/issues/7)

## Escopo
- Board de 9 colunas com scroll horizontal, drag-and-drop via dnd-kit (`core` + `sortable`) e atualização otimista.
- Card: título, progresso de subtarefas (x/y), badge de aging com cor, indicador de impedido.
- Sheet lateral de detalhes: status, impedimento (motivo), subtarefas e histórico de status.
- Rota `/board` com itens de todos os projetos.

## Critérios de aceite
- [x] Build e lint passam.
- [ ] Arrastar e soltar entre colunas validado no navegador (ver T09).

## Referências
Commit `da9af9c`; RF-06 a RF-10.

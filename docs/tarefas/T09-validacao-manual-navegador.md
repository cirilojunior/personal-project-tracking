# T09 — Validar manualmente as telas no navegador

**Status:** Aberta · **Labels:** `bug`, `frontend`

## Contexto
Na sessão inicial não foi possível abrir as telas num navegador. O arrastar e soltar do Kanban e o visual foram verificados apenas pelo build; páginas e API foram testadas via proxy.

## Escopo
Rodar backend (`.\mvnw.cmd spring-boot:run`) e frontend (`npm run dev`) e percorrer o fluxo ponta a ponta:
1. Criar cliente → projeto → requisitos RF e RNF → tarefa.
2. "Enviar para Delivery".
3. Arrastar o item por todas as 9 colunas (incluindo reordenar dentro da coluna).
4. Marcar e desmarcar impedido; conferir que atualizar o motivo mantém a data.
5. Conferir badge de aging (seed com datas retroativas) e histórico de status.
6. Conferir que o dashboard reflete as contagens.
7. Testar tema claro/escuro e largura de tela reduzida.

## Critérios de aceite
- [ ] Todos os passos acima funcionam sem erro visível.
- [ ] Defeitos encontrados registrados como novas issues.

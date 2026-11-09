# T10 — Persistir dados (H2 em arquivo ou PostgreSQL)

**Status:** Aberta · **Labels:** `enhancement`, `backend`

**Issue:** [#10](https://github.com/cirilojunior/personal-project-tracking/issues/10)

## Contexto
O banco H2 é em memória e os dados se perdem a cada reinício do backend. Como o schema vem do Flyway, a troca é pequena (RNF-07).

## Escopo
- Decidir entre H2 em arquivo (simples, local) e PostgreSQL (mais robusto).
- Novo perfil/configuração de datasource; manter `dev` (memória + seed) e `test` (banco separado, sem seed).
- Revisar compatibilidade do `V1__schema.sql` com o banco escolhido.
- Documentar no README (configuração e backup).

## Critérios de aceite
- [ ] Dados sobrevivem a reinício do backend.
- [ ] `./mvnw verify` continua passando.
- [ ] README atualizado.

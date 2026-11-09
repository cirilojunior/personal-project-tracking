# T02 — Backend: Clientes e Projetos

**Status:** Concluída · **Labels:** `enhancement`, `backend` · **Fase do plano:** 2

**Issue:** [#2](https://github.com/cirilojunior/personal-project-tracking/issues/2)

## Escopo
- Entidades `Cliente` e `Projeto` (FK para cliente), repositórios, serviços, controllers e DTOs (`record`s em `*Dtos.java`).
- Migração Flyway `V1__schema.sql` (`ddl-auto=none`).
- Status do projeto: `DISCOVERY`, `EM_ANDAMENTO`, `PAUSADO`, `CONCLUIDO`.
- Endpoints `/api/clientes` e `/api/projetos` (CRUD; filtros por status e cliente).
- Validação com Bean Validation, mensagens em pt-BR; erros via `ApiExceptionHandler` (`ProblemDetail`, `erros` por campo em 400).
- Swagger em `/swagger-ui.html`.

## Critérios de aceite
- [x] CRUD funcional de clientes e projetos.
- [x] Erros padronizados (400, 404, regra de negócio).
- [x] Testes passando em `./mvnw verify`.

## Referências
Commit `b61fceb`; RF-01, RF-02, RNF-02, RNF-03.

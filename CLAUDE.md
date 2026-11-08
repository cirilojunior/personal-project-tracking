# CLAUDE.md

Monorepo: `backend/` (Spring Boot 4.1, Java 25, Maven wrapper) e `frontend/` (Next.js 16 + shadcn/ui). UI e mensagens em pt-BR.

## Comandos
- Backend testes: `cd backend && ./mvnw verify` (Windows: `.\mvnw.cmd verify`)
- Backend rodar: `./mvnw spring-boot:run` → :8080 (perfil `dev`: H2 em memória + seed `shared/DevDataSeeder`)
- Frontend: `cd frontend && npm run dev | lint | build` → :3000, proxy `/api/*` → backend (`next.config.ts`)

## Backend
- Pacotes por feature em `br.com.clxj.tracker`: `cliente`, `projeto`, `discovery`, `delivery`, `dashboard`, `shared`.
- Schema só via Flyway (`src/main/resources/db/migration`); `ddl-auto=none`. Nova coluna = nova migração `V2__...`.
- DTOs são `record`s em `*Dtos.java`; erros via `ApiExceptionHandler` (ProblemDetail; `erros` por campo em 400).
- Regras de status/impedimento/aging ficam em `delivery/WorkflowService` (usa `Clock` injetado; testes em `WorkflowServiceTest`).
- Testes de integração usam `@ActiveProfiles("test")` (banco separado, sem seed).

## Frontend
- Next 16 com `cacheComponents`: rotas dinâmicas usam `page.tsx` (server) com `<Suspense>` envolvendo um client component que chama `useParams`/`useSearchParams`. Consulte `node_modules/next/dist/docs/` antes de usar APIs do Next.
- Tipos da API em `src/lib/types.ts`, cliente em `src/lib/api.ts`, rótulos pt-BR dos enums em `src/lib/labels.ts`.
- Mutações via `useMutacao` (`src/lib/hooks.ts`): toast + invalida todas as queries.
- Formulários: react-hook-form + zod com `src/components/campos.tsx` e `form-dialog.tsx`.

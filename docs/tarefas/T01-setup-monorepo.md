# T01 — Setup do monorepo e ambiente

**Status:** Concluída · **Labels:** `documentation`, `enhancement` · **Fase do plano:** 1

## Contexto
Diretório vazio, sem git. Máquina só com JDK 21 e git; sem Node nem Maven.

## Escopo
- Instalar/disponibilizar JDK 25 LTS e Node 24 LTS (o `winget` travou; foram usadas versões portáteis em `C:\Users\clxj\tools`, com `JAVA_HOME` e `PATH` do usuário).
- `git init` na raiz, branch `main`, `.gitignore`.
- Gerar `backend/` (Spring Boot, Maven Wrapper) e `frontend/` (Next.js, TypeScript, Tailwind v4, ESLint, shadcn init).
- Ambos sobem "vazios".

## Critérios de aceite
- [x] `backend` compila e sobe na porta 8080.
- [x] `frontend` sobe na porta 3000.
- [x] Estrutura de monorepo commitada.

## Referências
Commit `b61fceb`; seção 7 do `docs/PRD.md`.

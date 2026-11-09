# T05 — Frontend: base, Clientes e Projetos

**Status:** Concluída · **Labels:** `enhancement`, `frontend` · **Fase do plano:** 5

## Escopo
- Layout com Sidebar do shadcn, tema claro/escuro, `<html lang="pt-BR">`.
- Proxy `/api/*` → backend em `next.config.ts` (variável `API_URL`).
- `src/lib/types.ts` (tipos da API), `src/lib/api.ts` (cliente), `src/lib/labels.ts` (rótulos pt-BR dos enums), TanStack Query, `useMutacao` (toast + invalidação de queries).
- Formulários com react-hook-form + zod (`campos.tsx`, `form-dialog.tsx`).
- Telas: `/clientes`, `/clientes/[id]`, `/projetos`, `/projetos/[id]` (abas Visão geral, Discovery, Delivery).
- Rotas dinâmicas no padrão Next 16 com `cacheComponents`: `page.tsx` (server) com `<Suspense>` + client component.

## Critérios de aceite
- [x] `npm run lint` e `npm run build` sem erros.
- [x] Páginas respondem via proxy.

## Referências
Commit `da9af9c`; RF-01, RF-02, RNF-01.

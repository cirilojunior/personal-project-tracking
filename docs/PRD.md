# PRD — Tracker de Projetos de Consultoria

Fontes: `CLAUDE.md`, `README.md` e `sessao_exec_20261108_01.md`.
Status do documento: v1.0 (2026-11-08)

## 1. Visão geral

Sistema pessoal para um consultor freelancer (engenheiro de software) acompanhar os projetos em que trabalha, em duas etapas: **Discovery** (entender o que o cliente precisa) e **Delivery** (executar e acompanhar o fluxo de trabalho em um board Kanban).

## 2. Problema e objetivo

- **Problema:** projetos, requisitos do cliente e andamento das entregas ficam espalhados, sem visão única de prioridade, gargalos e itens parados.
- **Objetivo:** centralizar cadastro de clientes e projetos, requisitos (funcionais e não funcionais), tarefas de alto nível e o fluxo de entrega, com métricas simples de envelhecimento (Aging WIP).

## 3. Usuário

Um único usuário: o consultor (perfil avançado em programação). Uso pessoal, sem multiusuário nem autenticação nesta versão.

## 4. Escopo do MVP

### 4.1 Cadastros
- **Cliente:** nome, empresa, e-mail, telefone, observações.
- **Projeto:** nome, tema/área de negócio, descrição, cliente, status (`DISCOVERY`, `EM_ANDAMENTO`, `PAUSADO`, `CONCLUIDO`), datas de criação/início.

### 4.2 Discovery
- **Requisito:** código gerado (RF-001 / RNF-001), título, descrição, tipo (funcional / não funcional), categoria de NFR opcional, prioridade MoSCoW, status (`RASCUNHO`, `VALIDADO`, `APROVADO`, `DESCARTADO`). Filtros por tipo, status e prioridade.
- **Tarefa de alto nível:** título, descrição, prioridade, status (`A_FAZER`, `EM_ANDAMENTO`, `CONCLUIDA`), requisitos relacionados (N:N).
- **Enviar para Delivery:** cria um item em *Selecionado* a partir da tarefa (uma vez por tarefa) e marca a tarefa como *Em andamento*.

### 4.3 Delivery
- **Item de trabalho** com subtarefas, em board Kanban de 9 colunas: Selecionado → Em refinamento → Refinado → Em implementação → Implementado → Em testes → Testado → Aguardando planejamento de implantação → Concluído.
- Mover itens por arrastar e soltar, com ordem dentro da coluna.
- **Impedimento:** marcar com motivo; guarda a data; atualizar o motivo mantém a data original; ao concluir, o impedimento é removido; itens concluídos não podem ser impedidos.
- **Histórico de status:** toda mudança é registrada (`historico_status`), base para lead time e cycle time.
- **Aging WIP:** conta da primeira saída de *Selecionado* até *Concluído*. Faixas: verde < 5 dias, amarelo até 10, vermelho acima (configuráveis em `tracker.aging.*`).

### 4.4 Dashboard
Totais, itens por coluna, faixas de aging, itens impedidos e itens mais antigos em WIP.

## 5. Requisitos funcionais (resumo)

| Código | Requisito |
|---|---|
| RF-01 | CRUD de clientes |
| RF-02 | CRUD de projetos, com filtro por status e cliente |
| RF-03 | CRUD de requisitos com código automático e filtros |
| RF-04 | CRUD de tarefas de Discovery, vinculadas a requisitos |
| RF-05 | Enviar tarefa para Delivery (uma vez por tarefa) |
| RF-06 | CRUD de itens de trabalho e subtarefas |
| RF-07 | Mover item entre colunas e reordenar, registrando histórico |
| RF-08 | Marcar/remover impedimento com motivo |
| RF-09 | Calcular e exibir Aging WIP por item |
| RF-10 | Board por projeto e board geral (todos os projetos) |
| RF-11 | Dashboard com indicadores |

## 6. Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF-01 | UI e mensagens de erro em pt-BR |
| RNF-02 | Schema somente via Flyway (`ddl-auto=none`); nova coluna = nova migração |
| RNF-03 | Erros da API em `ProblemDetail` (RFC 9457), com `erros` por campo em 400 |
| RNF-04 | Regras de status, impedimento e aging isoladas em `WorkflowService`, com `Clock` injetado e testáveis |
| RNF-05 | API documentada (Swagger UI em `/swagger-ui.html`) |
| RNF-06 | Testes automatizados: unitários e de integração (perfil `test`, banco separado, sem seed) |
| RNF-07 | Troca de banco simples (H2 → arquivo/PostgreSQL) sem mudar o domínio |

## 7. Arquitetura e tecnologia

Monorepo com dois projetos:

| Parte | Tecnologia |
|---|---|
| `backend/` | Java 25 LTS · Spring Boot 4.1 · Spring Data JPA · H2 em memória · Flyway · springdoc · Maven Wrapper |
| `frontend/` | Next.js 16 (App Router, `cacheComponents`) · React 19 · shadcn/ui · Tailwind v4 · TanStack Query · react-hook-form + zod · dnd-kit |

- Backend organizado por feature em `br.com.clxj.tracker`: `cliente`, `projeto`, `discovery`, `delivery`, `dashboard`, `shared`.
- O frontend faz proxy de `/api/*` para o backend (`next.config.ts`, variável `API_URL`), evitando CORS.
- Decisão registrada: a ideia inicial (API dentro do Next.js) foi trocada por Next.js + Spring Boot, porque o H2 só roda dentro de um processo Java. Java 27 foi trocado por Java 25 LTS, porque o 27 ainda era early access.

## 8. Fora do escopo (MVP)

Autenticação e multiusuário, métricas de lead/cycle time em tela (apenas o histórico é gravado), integrações externas, notificações.

## 9. Critérios de aceite do MVP

1. `./mvnw verify` passa (10 testes na entrega inicial).
2. `npm run lint` e `npm run build` passam.
3. Fluxo ponta a ponta: criar cliente → projeto → requisitos RF/RNF → tarefa → "Enviar para Delivery" → arrastar pelas colunas → marcar/desmarcar impedido → conferir aging e histórico → dashboard reflete as contagens.

## 10. Plano de entrega

As tarefas ficam em `docs/tarefas/` e como issues no GitHub:

| Tarefa | Título | Status |
|---|---|---|
| [T01](tarefas/T01-setup-monorepo.md) · [#1](https://github.com/cirilojunior/personal-project-tracking/issues/1) | Setup do monorepo e ambiente | Concluída |
| [T02](tarefas/T02-backend-clientes-projetos.md) · [#2](https://github.com/cirilojunior/personal-project-tracking/issues/2) | Backend: Clientes e Projetos | Concluída |
| [T03](tarefas/T03-backend-discovery.md) · [#3](https://github.com/cirilojunior/personal-project-tracking/issues/3) | Backend: Discovery | Concluída |
| [T04](tarefas/T04-backend-delivery-dashboard.md) · [#4](https://github.com/cirilojunior/personal-project-tracking/issues/4) | Backend: Delivery e Dashboard | Concluída |
| [T05](tarefas/T05-frontend-base-clientes-projetos.md) · [#5](https://github.com/cirilojunior/personal-project-tracking/issues/5) | Frontend: base, Clientes e Projetos | Concluída |
| [T06](tarefas/T06-frontend-discovery.md) · [#6](https://github.com/cirilojunior/personal-project-tracking/issues/6) | Frontend: Discovery | Concluída |
| [T07](tarefas/T07-frontend-delivery-kanban.md) · [#7](https://github.com/cirilojunior/personal-project-tracking/issues/7) | Frontend: Delivery (Kanban) | Concluída |
| [T08](tarefas/T08-frontend-dashboard-seed-docs.md) · [#8](https://github.com/cirilojunior/personal-project-tracking/issues/8) | Frontend: Dashboard, seed e documentação | Concluída |
| [T09](tarefas/T09-validacao-manual-navegador.md) · [#9](https://github.com/cirilojunior/personal-project-tracking/issues/9) | Validar manualmente as telas no navegador | Aberta |
| [T10](tarefas/T10-persistencia-banco.md) · [#10](https://github.com/cirilojunior/personal-project-tracking/issues/10) | Persistir dados (H2 em arquivo ou PostgreSQL) | Aberta |

## 11. Riscos e pontos em aberto

- O arrastar e soltar do Kanban e o visual só foram verificados por build, não no navegador (T09).
- Dados em memória se perdem a cada reinício do backend (T10).
- Premissa de aging (início na primeira saída de *Selecionado*) é ajustável; confirmar com o uso real.

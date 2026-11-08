# Tracker de Projetos de Consultoria

Sistema pessoal para acompanhar projetos de consultoria em duas etapas:

- **Discovery**: cadastro do projeto (ideia, tema/área de negócio, cliente), requisitos
  funcionais e não funcionais (código RF-001/RNF-001, prioridade MoSCoW, status) e tarefas de alto nível.
- **Delivery**: board Kanban de itens de trabalho (com subtarefas) em 9 colunas —
  Selecionado → Em refinamento → Refinado → Em implementação → Implementado → Em testes →
  Testado → Aguardando planejamento de implantação → Concluído — com marcação de **impedido**,
  histórico de status e **Aging WIP**.
- **Dashboard** com totais, itens por coluna, faixas de aging, impedidos e itens mais antigos.

| Parte | Tecnologia |
|---|---|
| `backend/` | Java 25 · Spring Boot 4.1 · Spring Data JPA · H2 em memória · Flyway · springdoc (Swagger) |
| `frontend/` | Next.js 16 (App Router) · React 19 · shadcn/ui · Tailwind v4 · TanStack Query · dnd-kit |

## Pré-requisitos

- JDK 25 (`JAVA_HOME` apontando para ele)
- Node.js 24 LTS
- Maven não é necessário: use o wrapper `mvnw`.

## Rodando em desenvolvimento

Em dois terminais:

```powershell
# 1) Backend — http://localhost:8080
cd backend
.\mvnw.cmd spring-boot:run

# 2) Frontend — http://localhost:3000
cd frontend
npm install   # primeira vez
npm run dev
```

O frontend faz proxy de `/api/*` para o backend (`next.config.ts`; mude com a variável `API_URL`).

No perfil `dev` (padrão) o banco H2 em memória é recriado a cada início e populado com dados
de exemplo (datas retroativas para exercitar o aging).

- Swagger UI: http://localhost:8080/swagger-ui.html
- Console H2: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:tracker`, usuário `sa`, sem senha)

## Testes e build

```powershell
cd backend;  .\mvnw.cmd verify             # testes unitários + integração da API
cd frontend; npm run lint; npm run build
```

## Regras de negócio

- **Aging WIP**: conta a partir da primeira saída de *Selecionado* (ponto de compromisso) até
  *Concluído*. Faixas: verde abaixo de 5 dias, amarelo até 10, vermelho acima — configuráveis em
  `tracker.aging.*` (`backend/src/main/resources/application.properties`).
- **Impedimento**: guarda motivo e data; atualizar o motivo mantém a data original. Ao concluir
  o item, o impedimento é removido. Itens concluídos não podem ser impedidos.
- **Enviar para Delivery**: cria um item em *Selecionado* a partir de uma tarefa do Discovery
  (uma vez por tarefa) e marca a tarefa como *Em andamento*.
- Todas as mudanças de status são registradas em `historico_status` (base para lead/cycle time).

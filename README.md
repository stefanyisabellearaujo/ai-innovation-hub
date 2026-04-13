# AI Innovation Hub — Frontend

Interface construída com **Vue 3** (Composition API), **TypeScript**, **Tailwind CSS** e **Pinia**.

---

## Fluxo da Aplicação

### Arquitetura

```mermaid
flowchart LR
    subgraph FE["Frontend (Vue 3 · Pinia · Axios)"]
        UI["Componentes Vue\nRouter · Stores · Services"]
    end

    subgraph BE["Backend (FastAPI)"]
        AUTH["/api/auth"]
        IDEAS["/api/ideas"]
        AIEP["/api/ai"]
        ADM["/api/admin\n/api/ranking"]
    end

    subgraph EXT["API Externa"]
        HF["HuggingFace Inference API\nfacebook/bart-large-mnli\n(Zero-shot Classification)"]
    end

    DB[(PostgreSQL)]

    UI -->|"Bearer JWT"| AUTH
    UI -->|"Bearer JWT"| IDEAS
    UI -->|"Bearer JWT"| AIEP
    UI -->|"Bearer JWT"| ADM

    AUTH --> DB
    IDEAS --> DB
    ADM --> DB

    IDEAS -->|"HUGGINGFACE_TOKEN\nCriar / Editar ideia"| HF
    AIEP -->|"HUGGINGFACE_TOKEN\nCategorizar / Similares"| HF
```

---

### Fluxo principal

```mermaid
flowchart TD
    Start([Usuário acessa o app]) --> Auth{JWT válido?}

    Auth -- Não --> Login["Tela de Login / Cadastro\n(role: user · developer)"]
    Login -->|"POST /api/auth/login"| Token["JWT + role\narmazenados no Pinia"]
    Token --> Role
    Auth -- Sim --> Role{Role do usuário?}

    Role -- user --> PageUser["Listagem de Ideias\n/ideas"]
    Role -- developer --> PageDev["Ideias · Kanban · Ranking\n/ideas · /kanban · /ranking"]
    Role -- admin --> PageAdmin["Dashboard Administrativo\n/admin/dashboard"]

    PageUser --> CreateIdea["Criar Ideia\nPOST /api/ideas"]
    CreateIdea -->|"Descrição enviada"| HF["HuggingFace API\nbrat-large-mnli\nZero-shot classification"]
    HF -- Sucesso --> Categorized["Ideia salva\ncom categoria automática"]
    HF -- Falha ou sem token --> Fallback["Ideia salva\ncategoria = Other"]

    Categorized --> IdeaCard
    Fallback --> IdeaCard

    IdeaCard["Ideia na listagem"] --> Actions{Ações}
    Actions --> Vote["Votar (toggle)\nPOST /api/ideas/{id}/vote\nnão vota na própria ideia"]
    Actions --> Comment["Comentar\nPOST /api/ideas/{id}/comments"]
    Actions --> Similar["Ver similares\nPOST /api/ai/similar"]
    Actions --> EditContent["Editar titulo / descricao\nsomente o autor"]
    Actions --> DeleteIdea["Deletar\nsomente o autor"]

    PageDev --> Kanban["Kanban Board\nCards por status"]
    Kanban -->|"Arrastar card"| ChangeStatus["PUT /api/ideas/{id}\nmuda o status"]

    PageAdmin --> AdminStats["Metricas\nGET /api/admin/stats"]
    PageAdmin --> AdminUsers["Gerenciar roles\nPUT /api/admin/users/{id}/role"]
    PageAdmin --> AdminArchive["Arquivar ideias\nexclusivo do admin"]
```

---

### Ciclo de vida de uma ideia

```mermaid
stateDiagram-v2
    direction LR
    [*] --> idea : Criada por user ou developer
    idea --> evaluation : Colaborador / Admin
    evaluation --> idea : Colaborador / Admin
    evaluation --> development : Colaborador / Admin
    development --> evaluation : Colaborador / Admin
    development --> completed : Colaborador / Admin
    idea --> archived : Somente Admin
    evaluation --> archived : Somente Admin
    development --> archived : Somente Admin
    completed --> archived : Somente Admin
    completed --> [*]
    archived --> [*]
```

> Ideias nos estados `completed` e `archived` nao aceitam votos nem edicao de conteudo.
> Apenas o **admin** pode arquivar. Apenas o **autor** pode deletar ou editar conteudo.

---

## Executar com Docker (recomendado)

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# O padrão já funciona para uso local com Docker

# 2. Build e start
docker compose up --build -d

# Frontend disponível em: http://localhost:3000
```

> **Pré-requisito:** o backend deve estar rodando em `localhost:8000`.

---

## Executar localmente (sem Docker)

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# App disponível em: http://localhost:5173
```

Em modo dev, o Vite faz proxy automático de `/api/*` para `http://localhost:8000`.

---

## Variáveis de ambiente

| Variável | Descrição | Quando usar |
|----------|-----------|-------------|
| `BACKEND_URL` | URL do backend usada pelo **nginx** | Apenas com `docker compose up` |
| `VITE_API_URL` | URL da API usada pelo **Vite proxy** | Apenas com `npm run dev` |

> `BACKEND_URL` é substituída no nginx via `envsubst` sem necessidade de rebuild.

---

## Testes

```bash
npx vitest run    # execução única
npx vitest        # modo watch
```

---

## Estrutura de pastas

```
src/
├── assets/             # CSS global (Tailwind base)
├── components/
│   ├── auth/           # LoginForm, RegisterForm
│   ├── common/         # Pagination, SearchBar, StatusBadge
│   ├── dashboard/      # MetricsCards, IdeasTable, UserManagement
│   ├── ideas/          # IdeaCard, IdeaForm, IdeaFilters, IdeaBoard, KanbanColumn
│   │                   # VoteButton, CollaboratorSection, CommentSection
│   ├── layout/         # AppLayout, AppHeader, AppSidebar
│   └── ranking/        # PodiumSection, RankingTable
├── composables/        # useToast
├── config/             # navigation.ts — sidebar por role
├── router/             # Vue Router com guards de autenticação e role
├── services/           # api.ts (Axios + JWT), authService, ideaService,
│                       # collaborationService, aiService, adminService, rankingService
├── stores/             # Pinia: auth, ideas, collaboration, admin, ranking
├── types/              # Interfaces TypeScript globais
└── views/              # Páginas por role
```

---

## Navegação por role

| Role | Sidebar | Rota inicial |
|------|---------|--------------|
| **user** | Ideias, Minhas Ideias | `/ideas` |
| **developer** | Ideias, Minhas Ideias, Kanban, Ranking | `/ideas` |
| **admin** | Dashboard, Ideias, Usuários, Ranking | `/admin/dashboard` |

> **Admin** não pode ser criado pelo formulário de cadastro. Veja o [README do Backend](../backend/README.md).

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Framework | Vue 3 Composition API | Melhor TypeScript, reatividade granular |
| Estado | Pinia | Simples, tipado, compatível com DevTools |
| Estilo | Tailwind CSS | Utilitário, sem CSS custom, design system consistente |
| HTTP | Axios + interceptors | JWT automático, handler global de 401 |
| Build | Vite | HMR rápido, proxy de dev integrado |
| Drag & drop | vuedraggable | Wrapper do SortableJS; controle por card |
| Router | Vue Router 4 com guards | Proteção declarativa via meta.roles |
| Nginx | Template + envsubst | BACKEND_URL configurável sem rebuild |

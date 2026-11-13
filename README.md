# 📚 Líber — Gerenciador de Leituras

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js_14+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
</p>

> **Líber** é uma aplicação web full stack moderna e responsiva voltada para o gerenciamento de hábitos literários. Com ela, é possível pesquisar títulos na base do Google Books, organizar estantes personalizadas (Lendo, Quero Ler, Lidos, Abandonados), registrar metas e acompanhar a evolução detalhada de páginas lidas.

---

Como desenvolvedora em constante evolução, construí o **Líber** como um projeto de estudos aprofundado, aplicando práticas modernas de engenharia de software que vão além do básico de CRUDs:

### 🧩 1. Arquitetura Modular por Features (_Vertical Slice Architecture_)

No backend, optei por organizar o código em torno de **domínios de negócio** (`src/modules/*`), reunindo no mesmo diretório:

- Rotas (`*.routes.ts`)
- Controladores (`*.controller.ts`)
- Regras de negócio e serviços (`*.service.ts`)
- Validações de entrada com Zod (`*.schema.ts`)
- Testes automatizados (`__tests__/*.test.ts`)

**Por que essa escolha?**

- **Alta Coesão e Baixo Acoplamento**: Alterar uma funcionalidade (ex.: estante de leitura) não afeta outras áreas do sistema.
- **Preparado para IA**: A contextualização enxuta de cada pasta facilita enormemente a colaboração com ferramentas e agentes de inteligência artificial (como LLMs e copilotos), pois todo o ciclo de vida da funcionalidade está contido no mesmo escopo.

### 🧪 2. Qualidade e Testes Automatizados (Jest & Supertest)

- Cobertura com **testes de integração** no backend simulando requisições HTTP reais com Supertest.
- Execução isolada com banco de dados de teste, garantindo confiabilidade nas rotas de autenticação, catálogo e progresso de páginas.
- Scripts com `jest --runInBand` e compilação ultrarrápida usando SWC (`@swc/jest`).

### 🐳 3. Ambiente Containerizado com Docker

- Configuração de `docker-compose.dev.yml` orquestrando:
  - Banco de dados PostgreSQL 16 (com verificação de saúde via `healthcheck`);
  - API Node.js/Express;
  - Frontend Next.js.
- Garante paridade entre ambientes e simplifica a inicialização.

### 🚀 4. Esteira de CI/CD Completa com GitHub Actions

Pipelines independentes para backend e frontend (`.github/workflows/`):

- **Service Containers**: O GitHub Actions sobe um container temporário de PostgreSQL para aplicar migrações do Prisma e rodar os testes a cada _Push_ ou _Pull Request_.
- **Quality Gates**: Bloqueio de builds com falhas em linting (ESLint), checagem estrita de tipos no TypeScript (`tsc`) ou quebras nos testes automatizados.
- **Continuous Delivery**: Deploy automatizado pós-aprovação do pipeline — frontend na **Vercel** e backend no **Render**.

### 🛡️ 5. Tipagem Estrita e Segurança de Ponta a Ponta

- **TypeScript Estrito**: Sem uso indiscriminado de `any`.
- **Validação em Tempo de Execução**: Validação de contratos e requisições com **Zod** tanto no front quanto no back.
- **Autenticação Robusta**: Suporte a autenticação local com senhas criptografadas via **Bcrypt**, Google OAuth 2.0 e emissão de **Tokens JWT** seguros armazenados em cookies HTTP.
- **Camadas de Proteção HTTP**: Proteção contra ataques comuns através de middlewares como **Helmet**, **CORS** restritivo e **Express Rate Limit**.

---

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Framework**: Next.js 14+ (App Router) & React 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS (v4) & Shadcn UI
- **Gerenciamento de Estado**: Zustand
- **Formulários e Validação**: React Hook Form + Zod
- **Ícones & UX**: Lucide React & Next Themes (Suporte a Dark/Light Mode)

### Backend

- **Ambiente**: Node.js & Express
- **Linguagem**: TypeScript
- **Banco de Dados & ORM**: PostgreSQL & Prisma ORM
- **Autenticação**: Passport.js (JWT, Local & Google OAuth2.0)
- **Segurança**: Bcrypt, Helmet, CORS, Cookie Parser e Express Rate Limit
- **Inteligência Artificial**: Integração com Google GenAI SDK (`@google/genai`)

### Testes & DevOps

- **Testes**: Jest, Supertest & SWC
- **Containerização**: Docker & Docker Compose
- **Integração & Entrega Contínua**: GitHub Actions (CI/CD)
- **Hospedagem**: Vercel (Frontend) & Render (Backend)

---

## 📂 Estrutura do Projeto

```text
├── .github/workflows/          # Workflows do GitHub Actions (CI/CD para front e back)
├── backend/
│   ├── prisma/                 # Schema do banco e migrações
│   └── src/
│       ├── config/             # Configurações transversais (ex: rate limit)
│       ├── gateway/            # Clientes externos (Google Books API)
│       ├── libs/               # Instâncias compartilhadas (Prisma, Passport)
│       ├── middlewares/        # Middlewares de autenticação e segurança
│       ├── modules/            # Arquitetura modular orientada a features
│       │   ├── auth/           # Login, cadastro, tokens e OAuth
│       │   ├── books/          # Busca e catálogo de livros
│       │   ├── library/        # Estantes e estados de leitura do usuário
│       │   ├── reading-progress/ # Histórico e registro de páginas lidas
│       │   └── users/          # Perfil e preferências do usuário
│       └── server.ts           # Ponto de entrada da API Express
├── frontend/
│   └── src/
│       ├── app/                # Rotas e páginas (App Router do Next.js)
│       ├── api/                # Clientes de consumo HTTP
│       ├── components/         # Componentes compartilhados e Shadcn UI
│       ├── hooks/              # Custom React Hooks
│       ├── stores/             # Stores Zustand (ex: sidebar, modais)
│       └── schemas/            # Schemas Zod compartilhados no front
├── docs/                       # Documentação técnica detalhada
└── docker-compose.dev.yml      # Orquestração do ambiente local com Docker
```

---

## 🚀 Como Executar o Projeto Localmente

Você pode executar o projeto utilizando **Docker Compose** (recomendado para praticidade) ou rodando os serviços diretamente na sua máquina.

### Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (versão 20 LTS ou superior)
- [Docker](https://www.docker.com/) e Docker Compose (opcional, para execução conteinerizada)

---

### Opção 1: Via Docker Compose (Rápido e Automatizado)

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/liber-gerenciador-de-leituras.git
   cd liber-gerenciador-de-leituras
   ```

2. **Configure os arquivos de ambiente:**
   Copie os exemplos disponíveis:

   ```bash
   # No diretório backend:
   cp backend/.env.example backend/.env

   # No diretório frontend:
   cp frontend/.env.example frontend/.env
   ```

   _(Preencha as variáveis de ambiente necessárias em `backend/.env`, como segredos de JWT)_.

3. **Suba todos os containers:**

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

4. **Acesse as aplicações:**
   - **Frontend**: [http://localhost:3001](http://localhost:3001)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)
   - **PostgreSQL**: porta `5432`

---

### Opção 2: Execução Manual (Passo a Passo)

Caso prefira rodar sem Docker, certifique-se de ter uma instância do PostgreSQL ativa na porta `5432`.

#### 1. Configurando o Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Gere o cliente Prisma e execute as migrações no PostgreSQL
npx prisma generate
npx prisma migrate dev

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

A API estará em execução em `http://localhost:3000`.

#### 2. Configurando o Frontend

Em um novo terminal:

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor Next.js
npm run dev
```

O frontend estará acessível em `http://localhost:3001` (ou `http://localhost:3000`, conforme configurado no Next.js).

---

## 🧪 Executando Testes e Validações

O projeto conta com verificações estritas de qualidade:

```bash
# 1. Executar os testes automatizados do Backend (Jest + Supertest):
cd backend
npm test

# 2. Executar validação de tipos e compilação do Backend:
cd backend
npm run build

# 3. Executar o linter e checagem de tipos do Frontend (Next.js / ESLint):
cd frontend
npm run lint

# 4. Validar o build de produção do Frontend:
cd frontend
npm run build
```

---

# DIVA — API

API REST do sistema DIVA (Dados Integrados de Voos e Aeronaves), desenvolvida para o ICMBio. Responsável pela autenticação, leitura e escrita nas planilhas SharePoint via Microsoft Graph API, e validação dos registros de horas de voo.

## Tecnologias

- [Node.js 20](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/) — framework HTTP
- [@azure/msal-node](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) — autenticação server-to-server com Microsoft Entra ID
- [Microsoft Graph API v1.0](https://learn.microsoft.com/pt-br/graph/overview) — leitura e escrita nas planilhas SharePoint

## Pré-requisitos

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para rodar via container)
- App Registration no Microsoft Entra ID com permissões de aplicação (`Files.ReadWrite.All`, `Sites.ReadWrite.All`)

## Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/andersonalvescoelho/diva-api.git
cd diva-api
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com os valores do seu ambiente:

```env
# API
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080   # usado no CORS

# Microsoft Entra ID — permissões de aplicação (client credentials)
AZURE_CLIENT_ID=
AZURE_TENANT_ID=
AZURE_CLIENT_SECRET=

# SharePoint — Planilha de Controle de Voos
SP_DRIVE_ID_CTRL=
SP_ITEM_ID_CTRL=

# SharePoint — Planilha de Controle de Horas (tbControleVoosAR, tbControleVoosAF, tbUC)
SP_DRIVE_ID_OS=
SP_ITEM_ID_OS=
SP_SITE_ID_OS=
```

> As variáveis Azure e SharePoint são obrigatórias. A API sobe sem elas, mas falha ao tentar autenticar com o Microsoft Graph.

## Rodando localmente

### Modo desenvolvimento (com watch)

```bash
npm run dev
```

A API estará disponível em: **http://localhost:3000**

### Modo produção via Docker

```bash
docker compose up --build
```

A API estará disponível em: **http://localhost:3000**

Para rodar em background:

```bash
docker compose up --build -d
docker compose logs -f   # acompanhar logs
docker compose down      # derrubar
```

> Ao mudar apenas o `.env`, não é necessário reconstruir a imagem — basta restartar o container. As variáveis são lidas em runtime pelo processo Node.js.

## Estrutura do projeto

```
diva-api/
├── src/
│   ├── server.ts        # Entry point — inicialização do Fastify
│   ├── routes/          # Definição das rotas HTTP
│   ├── services/        # Lógica de negócio e integração com Graph API
│   └── config/          # Configuração do MSAL e variáveis de ambiente
├── dist/                # Código compilado (gerado pelo build)
├── Dockerfile
├── docker-compose.yml       # Uso local
├── docker-compose.prod.yml  # Produção (puxa imagem do GHCR)
└── .env.example
```

## Scripts disponíveis

| Comando         | Descrição                                     |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Inicia em modo desenvolvimento com watch      |
| `npm run build` | Compila o TypeScript para `dist/`             |
| `npm start`     | Inicia a partir do `dist/server.js` compilado |

## Repositório relacionado

- [diva-frontend](https://github.com/andersonalvescoelho/diva-frontend) — Interface web do sistema DIVA

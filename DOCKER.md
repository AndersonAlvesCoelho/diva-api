# Docker — diva-api

## Visão geral

A API é uma aplicação Node.js + Fastify + TypeScript construída em dois estágios:

1. **builder** — instala todas as dependências e executa `npm run build`, gerando o código compilado em `dist/`
2. **production** — parte de uma imagem limpa, instala apenas as dependências de produção (`--omit=dev`) e copia o `dist/`

As variáveis de ambiente são lidas em **runtime** pelo processo Node.js, não em tempo de build. Isso significa que a mesma imagem pode ser usada em qualquer ambiente — basta fornecer o `.env` correto.

---

## Pré-requisitos

- Docker Desktop instalado e rodando
- Arquivo `.env` criado na raiz do projeto (veja a seção abaixo)

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do repositório com base no `.env.example`:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `PORT` | Porta em que a API vai escutar (padrão: `3000`) |
| `NODE_ENV` | Ambiente de execução (`development` ou `production`) |
| `FRONTEND_URL` | URL do frontend, usada na configuração do CORS |
| `AZURE_CLIENT_ID` | Client ID do App Registration no Microsoft Entra ID |
| `AZURE_TENANT_ID` | Tenant ID do Microsoft Entra ID |
| `AZURE_CLIENT_SECRET` | Client Secret do App Registration |
| `SP_DRIVE_ID_CTRL` | Drive ID do SharePoint — Planilha de Controle de Voos |
| `SP_ITEM_ID_CTRL` | Item ID do SharePoint — Planilha de Controle de Voos |
| `SP_DRIVE_ID_OS` | Drive ID do SharePoint — Planilha de Controle de Horas |
| `SP_ITEM_ID_OS` | Item ID do SharePoint — Planilha de Controle de Horas |
| `SP_SITE_ID_OS` | Site ID do SharePoint — Planilha de Controle de Horas |

> As variáveis Azure e SharePoint são obrigatórias. Sem elas a API sobe mas falha ao tentar autenticar com o Microsoft Graph.

---

## Uso local

### Subir o container

```bash
docker compose up --build
```

O parâmetro `--build` reconstrói a imagem a cada execução. Para iterações onde apenas o `.env` mudou, pode rodar sem `--build` — a imagem já está em cache e as novas variáveis são injetadas em runtime.

A API estará disponível em: **http://localhost:3000**

### Subir em background

```bash
docker compose up --build -d
```

### Acompanhar logs

```bash
docker compose logs -f
```

### Derrubar o container

```bash
docker compose down
```

---

## Estrutura de arquivos Docker

```
diva-api/
├── Dockerfile              # Build multi-stage (builder + production)
├── docker-compose.yml      # Uso local — build a partir do código-fonte
├── docker-compose.prod.yml # Produção — puxa imagem do GHCR
├── .dockerignore           # Exclui node_modules, dist, .env do contexto de build
└── .env.example            # Modelo de variáveis de ambiente
```

---

## Produção (CGTI)

Em produção, a imagem é construída pelo GitHub Actions e publicada no GitHub Container Registry (GHCR). O servidor usa o `docker-compose.prod.yml`, que puxa a imagem pronta em vez de fazer o build local:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

O deploy é executado automaticamente a cada push na branch `main` via `.github/workflows/deploy.yml`. As variáveis de ambiente em produção devem estar em um arquivo `.env` no diretório `/opt/diva/api/` do servidor CGTI.

---

## Diferença entre frontend e backend no Docker

| | diva-frontend | diva-api |
|---|---|---|
| Variáveis lidas em | Tempo de build | Runtime |
| Mudar uma variável exige | Reconstruir a imagem | Só restartar o container |
| Imagem final contém | Nginx + arquivos estáticos | Node.js + código compilado |
| Porta exposta | 80 (interno) / 8080 (host) | 3000 |

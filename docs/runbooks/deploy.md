# Deploy na Vercel (web e API)

Dois projetos na Vercel, ambos importados do mesmo repositório (D-016, D-020). Sem domínio próprio por enquanto: os endereços são `*.vercel.app`. **Nenhum valor de segredo entra neste repositório, em issue ou em chat**: cada variável é colada direto no painel da Vercel a partir do `.env` local de quem configura.

## 1. Projeto do web (`apps/web`)

| Configuração (Settings → Build and Deployment) | Valor                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Root Directory                                 | `apps/web` (com "Include files outside the root directory" ligado)   |
| Framework Preset                               | Next.js                                                              |
| Build Command                                  | `cd ../.. && pnpm turbo run build --filter=@caixa-forte/web`         |
| Install / Output                               | padrão                                                               |
| Node.js Version                                | 24.x                                                                 |
| Production Branch (Settings → Environments)    | `develop` enquanto não houver lançamento; `main` a partir do go-live |

Variáveis (Production e Preview):

| Nome                            | Valor                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `ENABLE_EXPERIMENTAL_COREPACK`  | `1` (usa o pnpm do `packageManager`)                                             |
| `APP_ENV`                       | `staging`                                                                        |
| `FEATURE_FLAGS`                 | módulos liberados, separados por vírgula (ver `docs/runbooks/ambientes.md`)      |
| `DEMO_MODE`                     | `true` para a Ellen validar as telas com conteúdo de exemplo (nunca em produção) |
| `ENABLE_PREVIEW_ROUTES`         | `true` só se quiser `/design` e `/status`                                        |
| `NEXT_PUBLIC_APP_URL`           | URL do web na Vercel                                                             |
| `NEXT_PUBLIC_API_URL`           | URL da API na Vercel **com** `/api/v1`                                           |
| `NEXT_PUBLIC_SUPABASE_URL`      | igual ao `apps/web/.env.local`                                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | igual ao `apps/web/.env.local` (chave pública; **nunca** a `service_role`)       |

## 2. Projeto da API (`apps/api`)

A API roda como **uma função** (`apps/api/api/index.js`) que carrega o NestJS compilado em `dist/` (o `tsc` preserva o `emitDecoratorMetadata` da DI). O `apps/api/vercel.json` já define install, build, saída e o rewrite de todas as rotas para a função; no painel só entram o diretório raiz, o Node e as variáveis.

| Configuração      | Valor                                    |
| ----------------- | ---------------------------------------- |
| Root Directory    | `apps/api` (com arquivos de fora ligado) |
| Framework Preset  | Other (o `vercel.json` manda)            |
| Node.js Version   | 24.x                                     |
| Production Branch | a mesma do web                           |

Variáveis (Production e Preview):

| Nome                           | Valor                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`                                                                          |
| `NODE_ENV`                     | `production`                                                                 |
| `APP_ENV`                      | `staging`                                                                    |
| `FEATURE_FLAGS`                | os mesmos módulos do web                                                     |
| `API_CORS_ORIGINS`             | URL do web na Vercel (vírgula para mais de uma)                              |
| `API_TRUST_PROXY`              | `1` (a Vercel fica na frente da função)                                      |
| `SUPABASE_URL`                 | igual ao `apps/api/.env`                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`    | igual ao `apps/api/.env` — **só neste projeto**, nunca no web                |
| `MEDIA_SIGNING_SECRET`         | segredo novo de 32+ caracteres para staging (ex.: `openssl rand -base64 48`) |
| `API_DOCS_ENABLED`             | opcional (`false` para esconder o Swagger)                                   |

`WEB_REVALIDATE_URL` e `REVALIDATE_SECRET` só entram juntos (o mesmo segredo no web).

## 3. Supabase (Authentication → URL Configuration)

- **Site URL:** URL do web.
- **Redirect URLs:** `https://<web>.vercel.app/**` e o padrão dos previews do time.

## 4. Conferência depois de cada deploy

1. `https://<api>.vercel.app/api/v1/health` → 200 com `"status":"ok"`.
2. Web: `/entrar` abre; login com usuário de teste leva a `/app`.
3. Com `NEXT_PUBLIC_API_URL` apontando para a API: `/app/cursos` sem o aviso "não foi possível carregar" (com `DEMO_MODE` desligado).
4. `/admin` com conta da equipe pede o segundo fator e abre o painel.

## 5. Rollback

Vercel → Deployments → deploy anterior que funcionava → **Promote to Production** (web e API são independentes). Variável errada: corrigir no painel e **Redeploy** (variáveis só valem em build/deploy novo).

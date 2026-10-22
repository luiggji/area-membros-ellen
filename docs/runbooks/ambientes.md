# Ambientes dev / staging / produção (CF-012, Issue #15)

**Regra:** cada ambiente tem **banco, storage, Auth, gateway, e-mail e chaves próprios**. Staging nunca consulta dados reais e nenhum ambiente que não seja produção aponta para o banco de produção.

**Estado em 21/10/2026:**

- **Supabase cloud (D-015):** um projeto atende development e staging juntos, sempre com dados fictícios. Produção terá projeto próprio, criado antes do go-live.
- **Web na Vercel (D-016):** o projeto ainda não foi criado e não há domínio (P-005).
- **Ainda em aberto:** o host da API (CF-015) e o gateway em sandbox, que será o Stripe (D-017, CF-002).

## Matriz

| Recurso                                           | development                                                                | staging                                        | production                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| `APP_ENV`                                         | `development`                                                              | `staging`                                      | `production`                                     |
| Supabase (banco + Auth + Storage)                 | projeto cloud compartilhado dev+staging (D-015); local via Docker opcional | o mesmo projeto cloud de dev (D-015)           | projeto próprio `caixa-forte-prod`               |
| Dados                                             | seeds fictícios (CF-154)                                                   | seeds fictícios; nunca cópia de produção       | reais                                            |
| Gateway de pagamento                              | sandbox                                                                    | sandbox (conta separada se o gateway permitir) | produção                                         |
| E-mail transacional                               | captura local (Inbucket do Supabase)                                       | domínio de teste, envio só para a equipe       | domínio autenticado                              |
| Web / API                                         | `localhost:3000` / `localhost:4000`                                        | host de preview/staging (P-014)                | domínio final (P-005)                            |
| Rotas internas `/prototipo`, `/design`, `/status` | ligadas                                                                    | ligadas com `ENABLE_PREVIEW_ROUTES=true`       | desligadas                                       |
| Onde ficam os segredos                            | `.env` local (fora do git)                                                 | GitHub Environment `staging` + painel do host  | GitHub Environment `production` + painel do host |

## Variáveis

| Variável                        | Onde               | Segredo?      | Observação                                                                                            |
| ------------------------------- | ------------------ | ------------- | ----------------------------------------------------------------------------------------------------- |
| `APP_ENV`                       | web (server) e API | não           | decide quais destinos são aceitos                                                                     |
| `SUPABASE_URL`                  | API                | não           | URL do projeto do próprio ambiente                                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | API                | **sim**       | só na API; obrigatória fora de dev                                                                    |
| `NEXT_PUBLIC_SUPABASE_URL`      | web                | não           | mesma URL, exposta ao browser                                                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web                | não (pública) | protegida por RLS; nunca usar a service_role aqui                                                     |
| `SUPABASE_PRODUCTION_REF`       | web (server) e API | não           | ref público de produção, usado para **barrar** staging/dev apontando para ele                         |
| `FEATURE_FLAGS`                 | web (server) e API | não           | módulos não lançados (CF-158): dev liga tudo, staging/produção desligam; `nome` liga, `-nome` desliga |
| `REVALIDATE_SECRET`             | web (server) e API | **sim**       | revalidação das páginas públicas (CF-163); mesmo valor nos dois, 32+ caracteres                       |
| `WEB_REVALIDATE_URL`            | API                | não           | `https://<web>/api/revalidate`; vai junto com o segredo                                               |

Os modelos estão em `apps/api/.env.example` e `apps/web/.env.example`.

## Proteções no código

- **`checkEnvironmentIsolation`** (`@caixa-forte/contracts`), com testes nos três pacotes:
  - dev pode rodar sem banco;
  - staging e produção exigem banco próprio;
  - dev e staging que apontem para o ref de produção são recusados;
  - produção não aceita banco local nem projeto diferente do registrado.
- **API:** a validação roda no boot e a API **não sobe** com configuração violada. Fora de dev, também exige a `service_role` do próprio projeto.
- **Web:** o `/status` mostra o card "Ambiente e banco" com o ambiente, o projeto e o resultado da checagem.

## Checklist de provisionamento

1. Projeto dev+staging: já criado (D-015). Antes do go-live, criar `caixa-forte-prod` com acesso restrito e anotar o ref de produção.
2. Aplicar as migrations do zero no projeto dev+staging (runbook de migrations, CF-016) e rodar os testes de RLS (CF-155).
3. Cadastrar os segredos nos GitHub Environments `staging` e `production` e no host. Produção exige aprovação e só aceita deploy a partir de `main`.
4. Preencher `SUPABASE_PRODUCTION_REF` em todos os ambientes.
5. Conferir o `/status` de staging: o card "Ambiente e banco" precisa ficar verde.
6. Gateway e e-mail em sandbox no staging (CF-043, CF-100). Produção só no go/no-go (CF-126).

## Rotação e vazamento

- Chave vazada: rotacionar no painel do Supabase/gateway, atualizar o Environment e o host, e registrar no runbook de incidente (CF-018).
- Inventário, barreiras automáticas e procedimento completo: [segredos](segredos.md) (CF-019).

# Segredos e varredura de dependências (CF-019, Issue #21)

**Regra:** nenhum segredo no repositório. Cada ambiente tem chaves próprias (ver [ambientes](ambientes.md)) e cada chave fica num único lugar por ambiente. Este documento lista **nomes**, nunca valores.

## Inventário

| Segredo                                         | Usado por                 | development                              | staging / production                          |
| ----------------------------------------------- | ------------------------- | ---------------------------------------- | --------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                     | API (servidor)            | `apps/api/.env` local                    | GitHub Environment + host da API (CF-015)     |
| `SEED_USER_PASSWORD`                            | `pnpm seed:dev`           | `apps/api/.env` local                    | staging: idem dev; **production: não existe** |
| Senha do banco (Postgres)                       | `supabase link`/`db push` | digitada no terminal, não salva          | GitHub Environment (CF-015)                   |
| Token do Supabase CLI                           | `supabase` (CLI)          | credencial do Windows (`supabase login`) | GitHub Environment (CF-015)                   |
| `PAYMENT_WEBHOOK_SECRET` (Stripe)               | API (webhook)             | sandbox, `.env` local (CF-043)           | GitHub Environment + host (CF-043)            |
| `CLAUDE_CODE_OAUTH_TOKEN` / `ANTHROPIC_API_KEY` | workflow `claude-review`  | —                                        | secret do repositório (opcional)              |

**Não são segredos** (podem ir ao browser, protegidos por RLS): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/publishable) e `SUPABASE_PRODUCTION_REF`. O `env.ts` do web **recusa** chave secreta numa variável pública (CF-156).

Estado em 22/10/2026: nenhum secret cadastrado no GitHub (repositório nem Environments `staging`/`production`); só existem os `.env` locais de dev+staging (D-015).

## Barreiras automáticas

| Camada                               | O que barra                                                                                                                                | Onde                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `.gitignore`                         | `.env` e `.env.*` (exceto `.env.example`)                                                                                                  | repositório                   |
| GitHub push protection               | push com chave conhecida é **recusado** antes de chegar ao repositório                                                                     | GitHub (ligado em 22/10/2026) |
| GitHub secret scanning               | alerta de chave no histórico                                                                                                               | aba Security                  |
| gitleaks                             | segredo em qualquer commit da PR (histórico completo, saída redigida)                                                                      | CI `secret-scan`              |
| Semgrep `p/secrets` + OWASP          | segredo e padrão inseguro no código                                                                                                        | CI `sast`                     |
| `pnpm audit`                         | produção: moderada ou acima; tudo (dev/CI): alta ou acima                                                                                  | CI `dependency-security`      |
| Dependabot alerts + security updates | CVE nova abre alerta e PR de correção para `develop`                                                                                       | GitHub (ligado em 22/10/2026) |
| Dependabot version updates           | atualização semanal com quarentena de 7 dias (`cooldown`)                                                                                  | `.github/dependabot.yml`      |
| pnpm supply chain                    | versão com menos de `minimumReleaseAge`, queda de confiança (`trustPolicy`), dependência de git/tarball, script de instalação não auditado | `pnpm-workspace.yaml`         |
| Actions pinadas por SHA              | troca silenciosa de action                                                                                                                 | workflows                     |

PRs do Dependabot usam branches `dependabot/...`: o `branch-convention` só as aceita se o autor for o bot e o destino for `develop`. Passam por review e CI como qualquer PR.

## Riscos aceitos no audit

Só entra aqui achado **sem versão corrigida** e **fora do código de produção**. Fica em `auditConfig.ignoreGhsas` (`pnpm-workspace.yaml`) e é revisto a cada PR do Dependabot que toque o pacote; sai da lista assim que houver correção.

| GHSA                  | Pacote / severidade            | Caminho                                    | Por que é aceitável                                                            | Aceito em  |
| --------------------- | ------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------ | ---------- |
| `GHSA-vfj7-8cjw-p6xm` | `braces` ≤3.0.3 · alta         | `eslint-config-next` → `fast-glob`         | DoS com padrão de glob malicioso; só roda no lint, com padrões do próprio repo | 22/10/2026 |
| `GHSA-hp3w-g68c-fv3c` | `sprintf-js` ≤1.1.3 · moderada | `jest` → istanbul → `js-yaml` → `argparse` | DoS com formato malicioso; só roda nos testes da API                           | 22/10/2026 |

`trustPolicyExclude` (`semver@6.3.1`, `eslint-import-resolver-typescript@3.10.1`): versões antigas legítimas, publicadas antes de o npm ter provenance. Conferido em 22/10/2026: sem a exceção o install falha (`ERR_PNPM_TRUST_DOWNGRADE`).

## Rotação

1. Gerar a chave nova no painel do provedor (Supabase: Project Settings → API Keys; Stripe: Developers → API keys/Webhooks).
2. Atualizar **todos** os lugares da tabela de inventário para aquele ambiente (`.env` local, GitHub Environment, host).
3. Reiniciar o serviço e conferir o `/status`.
4. Revogar a chave antiga só depois que o novo valor estiver em uso.

## Vazamento

1. **Revogar ou rotacionar imediatamente** (seção acima). Apagar o commit não basta: o histórico e os forks já têm o valor.
2. Avaliar o alcance: `service_role` ignora RLS e dá acesso total ao banco do ambiente. Conferir os logs do Supabase/Stripe desde o vazamento.
3. Registrar no runbook de incidente (CF-018), sem copiar o valor vazado.
4. Fechar o alerta do secret scanning como "revoked".

# Módulos do front-end (Clean Architecture)

`src/app/` contém **só rotas** (App Router): páginas finas que compõem módulos. A lógica vive em `src/modules/<contexto>/`:

```
modules/<contexto>/
  domain/          tipos e regras puras do contexto (ex.: estado de exibição de um curso)
  application/     casos de uso do front: queries/mutations, server actions, mapeamento de contratos
  infrastructure/  clientes HTTP da API (/api/v1); dados do Supabase via `shared/lib/supabase` (CF-156)
  presentation/    componentes React do contexto (usam @caixa-forte/ui + tokens)
```

`src/shared/` guarda o que é transversal: `config/` (env validado), `lib/` (inclui os clientes Supabase tipados `server.ts`/`browser.ts`, só com chave pública), `ui/` (composições locais).

Regras:

- Componente de apresentação **não** decide autorização: o servidor/API decide (doc G §5).
- Nada de HEX solto: só tokens de `@caixa-forte/ui/theme.css`.
- Cache (CF-163, modelo clássico; sem Cache Components por causa do nonce e dos status 404/500): dado público com `publicFetch(url, ['prices'])` de `shared/lib/cache/policy` (tag + rede de segurança de 1h), revalidado pela API via `POST /api/revalidate`; área privada (`/app`, `/admin`) por requisição e `private, no-store` no proxy.
- Área privada é **sempre dinâmica**: a CSP com nonce (`src/proxy.ts`, CF-152) só alcança scripts de páginas renderizadas por requisição. O build falha se alguma rota de `/app` ou `/admin` for pré-renderizada.
- Portaria do `/admin` (CF-034): `admin/layout.tsx` decide com `adminAccess` (`identity/domain`) — sem sessão vai a `/entrar`, sem papel de equipe recebe 404, e toda a equipe precisa de MFA (TOTP): sem fator cadastrado ou sessão `aal1` vai a `/admin/mfa`. As telas do painel ficam em `admin/(painel)/`, que só renderiza com `aal2`.
- Estados `loading`, `empty`, `error`, `forbidden` obrigatórios em cada tela.
- Estados padrão (CF-157): `not-found.tsx`, `error.tsx` e `global-error.tsx` na raiz; `EmptyState`, `ErrorState` e `LoadingState` de `@caixa-forte/ui`.
- **Sem `loading.tsx` de segmento**: ele faz streaming, e `notFound()`/erros passam a responder HTTP 200 (404/500 viram só `noindex`). Carregamento vai dentro da página: `<Suspense fallback={<LoadingState />}>` em volta do trecho que busca dados.
- Sessão (CF-030): Server Component lê o usuário com `getSessionUser()` (`shared/lib/supabase/session`, valida no Auth); o proxy renova a sessão e manda `/app` sem login para `/entrar?next=…`. Destinos de redirect passam por `safeNext()` (sem open redirect). Mensagens de auth não revelam se o e-mail existe.
- Módulo não lançado (CF-158): navegação e CTAs consultam `isFeatureEnabled('<flag>')` de `shared/config/feature-flags` no servidor (desligado = item não aparece); a API usa `@RequireFeature('<flag>')` (desligado = 404). Catálogo em `@caixa-forte/contracts`.

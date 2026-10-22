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
- Área privada (`/app`, `/admin`) sem cache compartilhado (`no-store`); páginas públicas cacheáveis (CF-163).
- Área privada é **sempre dinâmica**: a CSP com nonce (`src/proxy.ts`, CF-152) só alcança scripts de páginas renderizadas por requisição. O build falha se alguma rota de `/app` ou `/admin` for pré-renderizada.
- Estados `loading`, `empty`, `error`, `forbidden` obrigatórios em cada tela.
- Estados padrão (CF-157): `not-found.tsx`, `error.tsx` e `global-error.tsx` na raiz; `EmptyState`, `ErrorState` e `LoadingState` de `@caixa-forte/ui`.
- **Sem `loading.tsx` de segmento**: ele faz streaming, e `notFound()`/erros passam a responder HTTP 200 (404/500 viram só `noindex`). Carregamento vai dentro da página: `<Suspense fallback={<LoadingState />}>` em volta do trecho que busca dados.

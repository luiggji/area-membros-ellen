# Módulos do front-end (Clean Architecture)

`src/app/` contém **só rotas** (App Router): páginas finas que compõem módulos. A lógica vive em `src/modules/<contexto>/`:

```
modules/<contexto>/
  domain/          tipos e regras puras do contexto (ex.: estado de exibição de um curso)
  application/     casos de uso do front: queries/mutations, server actions, mapeamento de contratos
  infrastructure/  clientes HTTP da API (/api/v1), cliente Supabase server/browser (CF-156)
  presentation/    componentes React do contexto (usam @caixa-forte/ui + tokens)
```

`src/shared/` guarda o que é transversal: `config/` (env validado), `lib/`, `ui/` (composições locais).

Regras:

- Componente de apresentação **não** decide autorização: o servidor/API decide (doc G §5).
- Nada de HEX solto: só tokens de `@caixa-forte/ui/theme.css`.
- Área privada (`/app`, `/admin`) sem cache compartilhado (`no-store`); páginas públicas cacheáveis (CF-163).
- Estados `loading`, `empty`, `error`, `forbidden` obrigatórios em cada tela.

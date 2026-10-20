# @caixa-forte/ui

Design system minimalista (sidebar vinho, canvas creme). Fontes de verdade: `docs/brand/v2/` (identidade, tokens) e `docs/G_DESIGN_SYSTEM_MINIMALISTA.md` (hierarquia e densidade). Catálogo visual vivo em `/design` (rota interna, `ENABLE_PREVIEW_ROUTES`).

- `theme.css`: tokens Tailwind 4 (`@theme`) como `bg-cf-bg`, `text-cf-text`, `bg-cf-primary`, `font-editorial`, `max-w-(--spacing-content-max)`.
- `cn()`: utilitário de classes.

## Componentes (CF-020)

| Componente                   | Uso                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `AppShell`                   | Áreas logadas: sidebar vinho (≥ `lg`), topbar, `<main>`. `width="wide"` no painel da equipe |
| `PublicShell`                | Páginas públicas: cabeçalho com a marca, conteúdo e rodapé                                  |
| `SkipLink`                   | "Pular para o conteúdo", já incluído nos dois shells                                        |
| `Button` · `buttonClasses()` | Variantes `primary`, `secondary`, `ghost`, `link`; `disabledReason` mostra o motivo         |
| `Card` · `Skeleton`          | Tons `surface`, `muted`, `deep`; bloco de carregamento                                      |

A marca (`BrandMark`) mora no app (`apps/web/src/shared/ui/brand-mark.tsx`) porque usa os PNGs oficiais via `next/image`. O pacote não depende do Next. Navegação, links e menus que precisam do router (sidebar com "Mais", drawer mobile) ficam no app e entram pelos slots `sidebar` e `topbar`. Para um link com cara de botão, use `<Link className={buttonClasses()}>`.

Componentes editoriais da home (`EditorialHero`, `JourneyFocusCard`, `CourseCard`...) chegam com CF-022, e `EmptyState`/`ErrorState` com CF-157.

Uso no app: `@import "tailwindcss"; @import "@caixa-forte/ui/theme.css";` + `@source` apontando para `packages/ui/src`.

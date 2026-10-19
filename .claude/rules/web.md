---
paths:
  - 'apps/web/**'
  - 'packages/ui/**'
---

# Regras — Web Next.js (`apps/web`) e UI (`packages/ui`)

- `src/app/` só tem rotas finas; lógica em `src/modules/<contexto>/{domain,application,infrastructure,presentation}`.
- Server Components por padrão; `'use client'` só onde há interação. Dados privados: `no-store`/dinâmico; páginas públicas cacheáveis com revalidação.
- Autorização **nunca** só no componente: o servidor (API/Server Action/RLS) decide. A UI apenas reflete.
- Segredos fora do front: só variáveis `NEXT_PUBLIC_*` validadas em `src/shared/config/env.ts`.
- Status de pagamento vem do servidor, nunca da query string.
- Cada tela trata `loading`, `empty`, `error`, `forbidden` (`loading.tsx`, `error.tsx`, `not-found.tsx` + estados de componente).
- Estilo: **somente tokens** de `packages/ui/src/theme.css` (`bg-cf-bg`, `text-cf-text`, `bg-cf-primary`, `font-editorial`…). Proibido HEX solto. Serifada só em títulos editoriais.
- Ao mexer em shell/home/cursos/comunidade, seguir `.claude/rules/ui-design.md`.
- Acessibilidade: labels, foco visível, navegação por teclado, contraste AA, `prefers-reduced-motion`, alvos de toque ≥ 44px.

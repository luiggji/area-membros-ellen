---
name: ui-check
description: Valida uma tela da Caixa Forte no browser real contra o design v1.1 minimalista — sobe o web, captura 1440×900 e 390×844, confere densidade, estados e acessibilidade. Use em Issues de UI antes do PR.
argument-hint: <rota, ex. /app>
---

# /ui-check $ARGUMENTS

1. Suba o app: `pnpm --filter @caixa-forte/web dev` (em background) e aguarde `http://localhost:3000`.
2. Abra a rota informada em um browser disponível (Claude in Chrome / browser embutido / Playwright quando instalado) e capture screenshots em **1440×900** e **390×844**; confira também 320, 768 e 1024 quanto a overflow.
3. Compare com `docs/references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png` em **composição e densidade** (não pixel-perfect).
4. Rode o agente `ui-reviewer` com os arquivos alterados e os screenshots.
5. Verifique manualmente: Tab percorre os controles com foco visível; estados vazio/erro/loading/sem permissão renderizam.
6. Salve os screenshots fora do repositório (ou em `docs/qa/` somente se forem sem dados pessoais) e anexe à PR. Reporte o veredito.

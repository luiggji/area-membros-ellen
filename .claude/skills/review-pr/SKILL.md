---
name: review-pr
description: Revisão objetiva e profunda de uma PR da Caixa Forte — código, segurança e UI em paralelo — separando BLOQUEANTES de FOLLOW-UPS para evitar ciclos infinitos de ajuste. Use quando pedirem para revisar uma PR.
argument-hint: <numero-da-pr>
---

# /review-pr $ARGUMENTS

1. Contexto: `gh pr view <n> --json title,body,headRefName,baseRefName,files,commits` e `gh pr diff <n>`. Identifique a Issue (`Closes #`) e leia os critérios de aceite dela.
2. Checks: `gh pr checks <n>`. CI vermelho = bloqueante (aponte o job e a causa).
3. Em **paralelo**, rode os agentes sobre o diff:
   - `code-reviewer` (sempre)
   - `security-reviewer` (sempre)
   - `ui-reviewer` (se houver arquivos em `apps/web/` ou `packages/ui/`)
4. Consolide **sem duplicatas** e verifique cada achado no código antes de reportar.
5. Saída final:
   ```
   PR #<n> — <título>   Issue #<i> (CF-###)
   VEREDITO: APROVAR | APROVAR COM FOLLOW-UPS | MUDANÇAS NECESSÁRIAS
   Critérios de aceite: ✔/✖ por item
   BLOQUEANTES: (arquivo:linha — problema — correção)
   FOLLOW-UPS: (título de Issue + P0/P1/P2)
   ```
6. Regra anti-trâmite: se é o **2º ciclo** de revisão, só reabra pontos bloqueantes que continuam sem correção; não traga achados novos não bloqueantes. Comentar na PR (`gh pr comment`) só se o usuário pedir.

---
name: open-pr
description: Fecha a implementação de uma Issue e abre a Pull Request para develop (ou main, se release/hotfix) com o template preenchido e evidências reais. Use quando a Issue estiver implementada e o usuário pedir para abrir a PR.
disable-model-invocation: true
---

# /open-pr

1. **Branch**: `pnpm branch:check` — tem de passar. Descubra a Issue pelo número da branch.
2. **Revisão do diff**: `git status --short`, `git diff --stat develop...HEAD`, `git diff --check`. Remova qualquer arquivo fora do escopo da Issue. Nada de `.env`, dados reais ou segredos.
3. **Gates locais** (registre a saída real): `pnpm check` (format:check, lint, typecheck, test, build). Se falhar, corrija antes; não abra PR vermelha.
4. **Auto-revisão rápida**: rode os agentes `code-reviewer` e `security-reviewer` (e `ui-reviewer` se tocou `apps/web`/`packages/ui`) em paralelo sobre o diff. Corrija BLOQUEANTES; FOLLOW-UPS viram Issues (pergunte antes de criar).
5. **Commit** (Conventional Commits, português): `git add <arquivos da issue>` → `git commit -m "feat: ..."`.
6. **Push e PR** (pedem confirmação):
   ```bash
   git push -u origin <branch>
   gh pr create --base develop --title "<tipo>: <resumo> (CF-###)" --body-file <corpo-preenchido>
   ```
   Corpo = `.github/pull_request_template.md` preenchido, com `Closes #<issue>`, testes executados (comando → resultado), riscos/rollback, screenshots se UI. Use `--draft` se algo ainda depende de decisão.
7. Informe o número **real** da PR retornado e acompanhe `gh pr checks <n>`.

---
name: release
description: Prepara uma release develop → main da Caixa Forte (gates G2–G4, changelog, PR de promoção, tag SemVer). Nunca faz merge/deploy sozinho. Use quando um marco (M1…M7) estiver concluído e o usuário pedir release.
disable-model-invocation: true
argument-hint: <versao, ex. 0.1.0>
---

# /release $ARGUMENTS

1. Confirme com o usuário a Issue de release (real) e a versão SemVer.
2. Estado: `git fetch origin` · `git log --oneline origin/main..origin/develop` · `gh pr list --base develop --state open`.
3. Gates (docs/E §10, docs/F §10) — liste cada um como ✔/✖/pendente com evidência:
   - G1: todas as PRs do marco mergeadas com CI verde.
   - G2: staging com migrations aplicadas, E2E críticos, QA visual, sandbox de pagamento.
   - G3: sem bug P0 aberto; P1 bloqueante resolvido; aprovação Ellen (produto) + Luiggi (técnica).
   - G4: backup verificado, plano de rollback, smoke definido.
4. Changelog: agrupe commits por tipo (feat/fix/…) com CF-IDs.
5. PR de promoção (pede confirmação): `gh pr create --base main --head develop --title "release: v<versao>"` com changelog + checklist de gates. Alternativa: branch `release/<issue>-v<versao>` se houver estabilização.
6. **Após o merge feito por humano**: sugerir `git tag v<versao>` e push da tag (com confirmação). Hotfixes posteriores voltam para `develop`.

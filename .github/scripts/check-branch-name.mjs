#!/usr/bin/env node
// Valida o Git Flow do projeto (docs/E_ENGINEERING_DELIVERY_PLAN.md §3, docs/H_GUIA_CLAUDE_CODE_GITFLOW.md §2).
// Uso local:  node .github/scripts/check-branch-name.mjs [head] [base] [corpoDaPR]
// No CI:      lê HEAD_REF, BASE_REF e PR_BODY do ambiente.
import { execSync } from 'node:child_process';

const BRANCH_PATTERN =
  /^(feat|fix|hotfix|refactor|perf|test|chore|docs|release)\/([0-9]+)-[a-z0-9]+(-[a-z0-9]+)*$/;

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const head = process.argv[2] ?? process.env.HEAD_REF ?? currentBranch();
const base = process.argv[3] ?? process.env.BASE_REF ?? '';
const body = process.argv[4] ?? process.env.PR_BODY ?? '';

const errors = [];

// PRs de promoção (develop → main) e de sincronização pós-hotfix (main → develop).
const isPromotion = base === 'main' && head === 'develop';
const isHotfixSync = base === 'develop' && head === 'main';

if (!isPromotion && !isHotfixSync) {
  const match = BRANCH_PATTERN.exec(head);
  if (!match) {
    errors.push(
      `Branch "${head}" inválida. Use tipo/<NUMERO_DA_ISSUE>-slug, ex.: feat/123-home-minimalista.`,
    );
  } else {
    const [, type, issue] = match;

    if (base === 'main' && !['release', 'hotfix'].includes(type)) {
      errors.push(
        `Só release/*, hotfix/* ou develop podem abrir PR para main. Recebido: ${type}/*.`,
      );
    }
    if (base === 'develop' && ['release', 'hotfix'].includes(type)) {
      errors.push(`${type}/* abre PR para main (depois sincroniza main → develop).`);
    }
    if (process.env.CI && !body.trim()) {
      errors.push(`PR sem descrição: preencha o template e referencie a Issue #${issue}.`);
    } else if (body && !new RegExp(`#${issue}\\b`).test(body)) {
      errors.push(
        `A descrição da PR deve referenciar a Issue #${issue} (ex.: "Closes #${issue}").`,
      );
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✖ ${error}`);
  process.exit(1);
}

console.log(`✔ Git Flow ok: ${head}${base ? ` → ${base}` : ''}`);

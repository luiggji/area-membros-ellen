#!/usr/bin/env node
// Bootstrap do GitHub a partir de docs/BACKLOG.md (idempotente: pode rodar várias vezes).
//
//   node .github/scripts/bootstrap-github.mjs labels              # labels de prioridade/tipo/onda/status
//   node .github/scripts/bootstrap-github.mjs milestones          # M0…M7 + Evolução
//   node .github/scripts/bootstrap-github.mjs issues --waves 0,1  # cria Issues das ondas (pula as já existentes)
//   node .github/scripts/bootstrap-github.mjs protect             # protege main e develop
//   node .github/scripts/bootstrap-github.mjs all --waves 0,1,2
//
// Requer `gh auth login`. Nunca inventa números: o número da Issue é o que o GitHub devolver,
// e é gravado na coluna "Issue #" do BACKLOG.md (commitar via PR docs/<n>-...).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const BACKLOG = join(ROOT, 'docs', 'BACKLOG.md');
const DOC_C = join(ROOT, 'docs', 'C_DEVELOPMENT_BACKLOG.md');

const REQUIRED_CHECKS = [
  'branch-convention',
  'lint-and-typecheck',
  'unit-integration',
  'build',
  'dependency-security',
  'secret-scan',
  'sast',
];

const LABELS = [
  ['P0', 'b60205', 'Prioridade: essencial ao MVP'],
  ['P1', 'd93f0b', 'Prioridade: próxima versão'],
  ['P2', 'fbca04', 'Prioridade: evolução'],
  ['type:feature', '693548', 'Funcionalidade'],
  ['type:bug', 'd73a4a', 'Defeito'],
  ['type:chore', 'c39b83', 'Infra, setup, dependências'],
  ['type:docs', '0075ca', 'Documentação / decisão'],
  ['type:test', '277253', 'Testes e QA'],
  ['type:security', '321927', 'Segurança / privacidade'],
  ['status:backlog', 'ededed', 'No backlog'],
  ['status:ready', 'c2e0c6', 'Definition of Ready ok'],
  ['status:blocked', '000000', 'Bloqueada por dependência ou decisão'],
  ['needs-decision', 'f9d0c4', 'Depende de decisão de negócio (P-###)'],
  ['dependencies', 'ebd7cf', 'Atualização de dependências'],
  ...Array.from({ length: 12 }, (_, wave) => [
    `onda:${wave}`,
    'f3eae4',
    `Onda ${wave} do BACKLOG.md`,
  ]),
];

const MILESTONES = [
  ['M0 — Entendimento', 'Decisões, referência minimalista e estado do repositório'],
  ['M1 — Fundação', 'App protegido, hierarquia minimalista e papéis testados'],
  ['M2 — Pagamentos', 'Mensal e anual homologados ou anual bloqueado explicitamente'],
  ['M3 — Café', 'Vender 1 ingresso de teste e validar QR no check-in'],
  ['M4 — Conteúdo', 'Owner publica curso, membro estuda/progride'],
  ['M5 — Comunidade', 'Perfil opt-in, grupos/posts/comentários e denúncia'],
  ['M6 — Jornada & gestão', 'Home minimalista, meta privada, relatórios reais'],
  ['M7 — QA/release', 'Evidências, go/no-go e produção rastreável'],
  ['Evolução', 'P1/P2 após o go-live'],
];

function gh(args, { input } = {}) {
  return execFileSync('gh', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function repo() {
  return gh(['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner']);
}

function ensureLabels() {
  for (const [name, color, description] of LABELS) {
    gh(['label', 'create', name, '--color', color, '--description', description, '--force']);
    console.log(`label ✔ ${name}`);
  }
}

function existingMilestones(nameWithOwner) {
  const raw = gh(['api', `repos/${nameWithOwner}/milestones?state=all&per_page=100`]);
  return new Map(JSON.parse(raw).map((m) => [m.title, m.number]));
}

function ensureMilestones(nameWithOwner) {
  const existing = existingMilestones(nameWithOwner);
  for (const [title, description] of MILESTONES) {
    if (existing.has(title)) continue;
    gh([
      'api',
      `repos/${nameWithOwner}/milestones`,
      '-f',
      `title=${title}`,
      '-f',
      `description=${description}`,
    ]);
    console.log(`milestone ✔ ${title}`);
  }
}

/** Critérios de aceite por CF-ID, vindos do doc C (fonte oficial). */
function acceptanceFromDocC() {
  const map = new Map();
  for (const line of readFileSync(DOC_C, 'utf8').split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    const id = cells[1]?.replace(/\*/g, '');
    if (id && /^CF-\d{3}$/.test(id)) map.set(id, cells[5] ?? '');
  }
  return map;
}

/** Linhas das tabelas por onda do BACKLOG.md. */
function backlogRows() {
  const rows = [];
  let wave = null;
  let milestone = null;
  for (const [index, line] of readFileSync(BACKLOG, 'utf8').split('\n').entries()) {
    const header = /^### Onda (\d+) — .*?(\((M\d)\)|Evolução)/.exec(line);
    if (header) {
      wave = Number(header[1]);
      const code = header[3];
      milestone = code ? MILESTONES.find(([t]) => t.startsWith(code))?.[0] : 'Evolução';
      continue;
    }
    if (line.startsWith('#')) {
      wave = null; // qualquer outro título encerra a tabela da onda
      continue;
    }
    const cells = line.split('|').map((c) => c.trim());
    if (wave === null || cells.length < 10 || !/^\d+\.\d+$/.test(cells[1] ?? '')) continue;
    const id = /CF-\d{3}/.exec(cells[2])?.[0];
    if (!id) continue;
    rows.push({
      lineIndex: index,
      wave,
      milestone: milestone ?? 'Evolução',
      order: cells[1],
      id,
      priority: cells[3],
      title: cells[4].replace(/\*\*/g, '').replace(/\s*\*Justificativa:.*$/, ''),
      deps: cells[5],
      branch: cells[6],
      size: cells[7],
      decision: cells[8],
      issue: cells[9],
    });
  }
  return rows;
}

function typeLabel(branch) {
  const type = /`?(\w+)\//.exec(branch)?.[1];
  return (
    { feat: 'type:feature', fix: 'type:bug', docs: 'type:docs', test: 'type:test' }[type] ??
    'type:chore'
  );
}

function existingIssues() {
  const raw = gh(['issue', 'list', '--state', 'all', '--limit', '500', '--json', 'number,title']);
  const map = new Map();
  for (const issue of JSON.parse(raw)) {
    const id = /^\[(CF-\d{3})\]/.exec(issue.title)?.[1];
    if (id) map.set(id, issue.number);
  }
  return map;
}

function createIssues(waves) {
  const acceptance = acceptanceFromDocC();
  const existing = existingIssues();
  const lines = readFileSync(BACKLOG, 'utf8').split('\n');
  let changed = false;

  for (const row of backlogRows().filter((r) => waves.includes(r.wave))) {
    let number = existing.get(row.id);
    if (!number) {
      const labels = [row.priority, typeLabel(row.branch), `onda:${row.wave}`, 'status:backlog'];
      if (row.decision && row.decision !== '—') labels.push('needs-decision');
      const body = [
        `**CF-ID:** ${row.id} · **Prioridade:** ${row.priority} · **Onda:** ${row.wave} (ordem ${row.order}) · **Tamanho:** ${row.size}`,
        '',
        `**Objetivo:** ${row.title}`,
        '',
        `**Critério de aceite (doc C):** ${acceptance.get(row.id) || 'definir no refinamento (item novo do BACKLOG.md)'}`,
        '',
        `**Dependências:** ${row.deps}`,
        `**Decisão pendente:** ${row.decision}`,
        `**Branch:** ${row.branch.replace('<issue>', '<ESTE_NUMERO>')} — criar a partir de \`develop\``,
        '',
        'Referências: `docs/BACKLOG.md`, `docs/C_DEVELOPMENT_BACKLOG.md`, `docs/A_PRD_MASTER_CAIXA_FORTE.md`.',
        'Definition of Done: CLAUDE.md §"Definition of Done".',
      ].join('\n');
      const url = gh(
        [
          'issue',
          'create',
          '--title',
          `[${row.id}] ${row.title}`.slice(0, 250),
          '--body-file',
          '-',
          '--label',
          labels.join(','),
          '--milestone',
          row.milestone,
        ],
        { input: body },
      );
      number = Number(url.split('/').pop());
      console.log(`issue ✔ #${number} ${row.id}`);
    }
    const cells = lines[row.lineIndex].split('|');
    const current = cells[cells.length - 2]?.trim();
    if (current !== `#${number}`) {
      cells[cells.length - 2] = ` #${number} `;
      lines[row.lineIndex] = cells.join('|');
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(BACKLOG, lines.join('\n'));
    console.log('BACKLOG.md atualizado com os números reais — commitar via PR docs/<issue>-...');
  }
}

function protect(nameWithOwner) {
  for (const branch of ['main', 'develop']) {
    const payload = {
      required_status_checks: { strict: true, contexts: REQUIRED_CHECKS },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 0,
        require_code_owner_reviews: false,
        dismiss_stale_reviews: true,
      },
      restrictions: null,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_conversation_resolution: true,
    };
    try {
      gh(
        [
          'api',
          '-X',
          'PUT',
          `repos/${nameWithOwner}/branches/${branch}/protection`,
          '--input',
          '-',
        ],
        {
          input: JSON.stringify(payload),
        },
      );
      console.log(`proteção ✔ ${branch}`);
    } catch (error) {
      const message = String(error.stderr || error.message);
      console.error(`proteção ✖ ${branch}: ${message.split('\n')[0]}`);
      if (/upgrade|403|not available/i.test(message)) {
        console.error(
          '  → Repositório privado em conta Free não suporta branch protection. Opções: GitHub Pro ou repo público.',
        );
      }
    }
  }
}

const [command = 'all', ...rest] = process.argv.slice(2);
const wavesArg = rest[rest.indexOf('--waves') + 1];
const waves = rest.includes('--waves') && wavesArg ? wavesArg.split(',').map(Number) : [0, 1, 2];

if (command === 'plan') {
  // Simulação local, sem GitHub: mostra o que seria criado.
  for (const row of backlogRows().filter((r) => waves.includes(r.wave))) {
    console.log(
      `${row.order.padEnd(6)} ${row.id} ${row.priority} [${row.milestone}] ${typeLabel(row.branch)} ${row.title.slice(0, 70)}`,
    );
  }
  process.exit(0);
}

const nameWithOwner = repo();

if (['labels', 'all'].includes(command)) ensureLabels();
if (['milestones', 'all'].includes(command)) ensureMilestones(nameWithOwner);
if (['issues', 'all'].includes(command)) createIssues(waves);
if (['protect', 'all'].includes(command)) protect(nameWithOwner);

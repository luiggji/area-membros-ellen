# CLAUDE CODE — VISUAL IMPLEMENTATION HANDOFF (CAIXA FORTE V2)

**Source of truth hierarchy**
1. This pack's `05_UI_DESIGN_SYSTEM/STYLE_GUIDE.md` and brand tokens for *visual* decisions.
2. `10_REFERENCES/approved_minimalist_dashboard.png` for hierarchy and feeling, **not actual user data**.
3. PRD v1.1 A–F for functional/security requirements.
4. Actual repository's architecture and standards after inspection.

## Start sequence
1. Inspect Git status, active branch, repo layout, Next/React/Tailwind versions, auth, tests, CI and Supabase migrations.
2. Read PRD v1.1, existing `CLAUDE.md` and product decisions; identify conflicts rather than overwriting.
3. Report audit and implementation plan, including screen order, shared components, tests and dependencies.
4. Confirm real GitHub Issue number for each task; **never invent it**.
5. Create branch `feat/<issue>-<slug>` or `fix/<issue>-<slug>` from `develop`. No commit directly on main/develop.
6. Implement one isolated slice per PR. Prefer tokens + sidebar + shell before full feature views.
7. Run lint, typecheck, unit/integration tests, E2E relevant to changed features, build and accessibility checks.
8. Open PR with screenshots (desktop/mobile), linked Issue, risks, migration/rollback notes.
9. Wait for CI and review. Validate in staging before release to main/production.

## UI non-negotiables
- Very minimal dashboard: 1 hero + 1 journey + up to 3 course cards + 2 secondary blocks; never recreate crowded dark gallery mock.
- Cream canvas, wine sidebar, quiet cards, display serif headings, Inter controls and generous spacing.
- Content and percent derived from API; never hardcode fake user numbers or events.
- No fabricated professional photos or copied mock testimonials. Use authorized photo assets, else placeholder graphic.
- Components keyboard accessible, focus visible, responsive, reduced motion.

## Security
- No browser-trusted authorization for subscriptions, ticket QR or private materials.
- Protected routes checked server-side, RLS/access controls tested, webhook signature/idempotency verified.
- Migration changes require separate review. Never test against production data.

## PR template
Title: `[P0|P1|P2] feat: <clear description>`
Summary / linked issue / affected modules / before-after screenshots / checklist / tests run / accessible states / security considerations / rollback / outstanding risks.

## Branch number caveat
A GitHub PR number is assigned **after PR creation**; use precreated Issue number in branch name. Track actual PR number in GitHub link and metadata. No mandatory ID in each commit.

## Release gates
GitHub Actions CI green + approved review + staging smoke tests + no open P0 or blocking P1 bug. Deploy authorized. Audit logs and rollback prepared.

## First Claude Code prompt
“Leia este handoff e os PRDs. Analise o repositório sem mudar código. Identifique componentes já existentes e diferenças para a referência minimalista. Proponha a primeira PR estritamente para tokens, shell de layout e sidebar, com Issue real numerada, screenshots e testes. Aguarde aprovação antes de implementar.”

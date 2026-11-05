# Git Flow operacional

Permanent: `main` (production), `develop` (integration). Temporary: `feat/123-course-grid`, `fix/124-ticket-checkin`, `chore/125-ci`, `test/126-rls-checks`, `hotfix/127-auth-guard`, `release/128-v1-0-0`.

Identifier is the actual GitHub **Issue** number. PR numbers are assigned later and tracked in PR metadata. Commits need not carry Issue/PR number; Conventional Commits encouraged.

`feat/*` from develop -> PR to develop -> CI + review -> staging. Release PR develop -> main -> approved production deployment. Hotfix from main -> PR to main, then backport/cherry-pick or merge to develop with review; avoid diverging branches. Branch protections, checks required, force push prohibited on protected branches.

Single developer policy: PR review still required by independent human or an explicitly governed exception; do not self-approve security-critical changes. Do not bypass review just because a bot is coding.

**Workflow gate**: PR code review, test, lint, build, security scans, staging functional QA, preview screenshots, rollback notes for risky changes, deployment approval. `P0/P1/P2` requirement priorities separate from bug severities.

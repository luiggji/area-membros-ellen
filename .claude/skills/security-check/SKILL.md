---
name: security-check
description: Varredura de segurança local das mudanças atuais (ou de um caminho) antes de abrir PR — audit de dependências, busca de segredos, padrões perigosos e revisão do agente security-reviewer.
argument-hint: '[caminho opcional]'
---

# /security-check $ARGUMENTS

1. Escopo: diff atual contra `develop` (`git diff develop...HEAD`) ou o caminho informado.
2. Dependências: `pnpm audit --prod --audit-level high`.
3. Busca rápida com Grep no escopo:
   - segredos: `SERVICE_ROLE`, `sk_live`, `-----BEGIN`, `api[_-]?key\s*[:=]`, `password\s*[:=]`
   - client com segredo: `NEXT_PUBLIC_.*(SECRET|KEY|TOKEN)` (exceto ANON_KEY), `service_role` em `apps/web`
   - XSS/injeção: `dangerouslySetInnerHTML`, `eval(`, template SQL concatenado, `$queryRawUnsafe`
   - RLS: `create table` sem `enable row level security` no mesmo arquivo de migration; `using (true)`
   - pagamentos: uso de `success_url`/query param para liberar acesso; `parseFloat` com valores monetários
4. Rode o agente `security-reviewer` no diff.
5. Reporte: risco geral, BLOQUEANTES, FOLLOW-UPS e testes de segurança faltando (QA-###). Não altere código sem pedir.

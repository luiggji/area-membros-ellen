# Testes de RLS (pgTAP)

Um arquivo `<tabela>.test.sql` por tabela com PII. Cada um cobre no mínimo:

- titular lê/edita apenas os próprios registros;
- outro membro (B) **não** lê registros de A (IDOR);
- anônimo e assinatura expirada bloqueados;
- papel `commercial` limitado aos campos operacionais.

Executar: `npx supabase test db` (exige banco local ou de teste). Entram no CI no CF-155.

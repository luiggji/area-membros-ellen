---
paths:
  - 'apps/web/src/app/**'
  - 'apps/web/src/modules/**/presentation/**'
  - 'packages/ui/src/**'
---

# Design v1.1 minimalista — checklist obrigatório (doc G + UI-001…UI-010)

Referência: `docs/references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png` = **composição e sensação**, não pixel-perfect nem fonte de conteúdo.

- Sidebar vinho (`cf-sidebar`), canvas creme (`cf-bg`), muito respiro, uma cor de acento por tela.
- Navegação: até 6 itens (Início, Minha Jornada, Cursos, Comunidade, Café Estratégico, Assinatura) + **Mais** (Conexões, Ao Vivo, Cofre de Materiais, Meu Planejamento, Ajuda). Mobile: drawer ou barra inferior ≤ 4 + Mais.
- Home do membro: **1 hero + 1 card de jornada (um único CTA) + até 3 cursos + até 2 auxiliares**. Sem gráficos, rankings, contadores, feed completo, carrossel automático.
- Estados honestos: primeiro acesso → "Começar diagnóstico"; sem curso/evento/post → mensagem verdadeira ou ocultar; nunca "62%" sem cálculo real.
- Proibido: dark mode integral, 3D/metálico, glassmorphism, sombras pesadas, excesso de badges, botões sem ação.
- Rosto da referência é **sintético** — nunca usar como Ellen. Sem textos "para advogadas" (público inclusivo).
- Minimalismo nunca esconde erro, cobrança, aviso de privacidade ou elemento obrigatório de checkout.
- Admin (`/admin`) pode ser mais denso (tabelas/filtros), mesmos tokens.
- PR de UI: screenshots reais 1440×900 e 390×844; testar 320/375/768/1024; mudança no shell/home exige aprovação da Ellen.

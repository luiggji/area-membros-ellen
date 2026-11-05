# Navegação minimalista

## Sidebar desktop (até 6 opções primárias)
- Início `/app`
- Minha Jornada `/app/jornada`
- Cursos `/app/cursos`
- Comunidade `/app/comunidade`
- Café Estratégico `/eventos` (destino público)
- Assinatura `/app/assinatura`

Acesso secundário contextual: Conexões, Ao vivo, Cofre de Materiais, Meu Planejamento, Ajuda, Perfil. Eles continuam **funcionalidades P0** conforme PRD, mesmo quando não estão no primeiro nível visual.

## Mobile
Bottom nav com Início, Cursos, Comunidade, Eventos e Mais, com rótulos. Sem nav horizontal lotado. Dentro de Mais: Conexões, Jornada, Materiais, Planejamento, Conta e Ajuda.

## Administrativo
Seção `/admin` em layout separado com permissões owner / técnico / comercial. Check-in acessível apenas a operadores autorizados. Informações financeiras não expostas à comercial sem autorização.

## Integração futura
Mantenha o produto independente inicialmente. Futuro portal Ellen Conrado com SSO e redirecionamentos sem quebrar URLs públicas, páginas de evento ou autenticação.

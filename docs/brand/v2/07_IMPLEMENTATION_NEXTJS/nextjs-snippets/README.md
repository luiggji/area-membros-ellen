# Snippets de implementação Next.js

Exemplos orientativos com Next.js App Router, React, Tailwind 4 e TypeScript. **Não são uma aplicação instalável nem substituem código do repositório real.**

- Inspecione a versão atual de Tailwind. `@theme inline` é para v4, não compatível com v3 sem adaptação.
- Copie `symbol-3d.png` para `public/brand` antes de usar `BrandMark.tsx`.
- `MinimalHome` recebe dados autorizados do servidor: não hardcode progresso, assinantes, datas ou preços.
- Autorização para courses/streaming/pagamentos permanece no backend, não nesses componentes.
- Tokens disponíveis em `04_DESIGN_TOKENS`.
- Verificar responsividade, i18n, legendas, focus states, alt texts e loads.

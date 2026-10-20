# Tokens de design — fonte de verdade para implementação

- `palette.raw.json`: cores de referência.
- `tokens.semantic.json`: valores por função de interface (fonte recomendada para engenharia).
- `caixa-forte-tokens.css`: variáveis CSS e estilos base prefixados.
- `tailwind-v4-theme.css`: exemplo para **Tailwind CSS 4**. Adaptar caso o repositório use Tailwind 3; não misturar versões cegamente.
- `palette-reference.png`: prova visual de cores.

**Conflitos:** O PRD v1.1 e a referência minimalista aprovada têm precedência sobre textos gerados automaticamente nas artes antigas. A aprovação aqui é da *direção de aparência*, não de cada código HEX isolado. Ajustes definitivos devem ser registrados no Decision Log e refletidos em todos os tokens.

**Fontes:** recomenda-se `Playfair Display` para títulos editoriais e `Inter` para UI. Não estão incluídos arquivos de fontes. Validar licença, carregamento e métricas; fallback Georgia e system-ui.

**Acessibilidade:** Não usar rosé, champagne ou gold como texto pequeno sobre branco sem verificar contraste. Reservar primary e ink para leitura e ações. Layout mínimo 320px, alvos interativos 44px, foco visível e reduced motion.

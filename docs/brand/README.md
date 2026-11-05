# Marca — Brand System V2 (agência, 20/10/2026)

`v2/` guarda o kit de identidade visual entregue pela agência (`CAIXA_FORTE_BRAND_SYSTEM_PROFISSIONAL_AGENCIA_TECH_V2.zip`). Decisão de adoção: **D-014** em `docs/D_DECISION_LOG.md`.

**Precedência:** o PRD v1.1 (docs A–F) governa funcionalidades, segurança e regras de negócio. O kit V2 governa identidade, UI/UX e tokens. O doc G continua valendo para hierarquia e densidade (1 hero + 1 jornada + ≤ 3 cursos + ≤ 2 auxiliares).

| Pasta                      | Uso                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `00_START_HERE`            | ordem de leitura, status de aprovação, prévia rápida                                      |
| `01_BRAND_MASTERS`         | PNGs master (logotipo horizontal, empilhado, símbolo 3D)                                  |
| `02_LOGO_VARIANTS`         | variações e a nota de que o SVG simplificado **não** é logo oficial                       |
| `03_FAVICONS_APP_ICONS`    | favicon, ícones do app, maskable, imagem social                                           |
| `04_DESIGN_TOKENS`         | `tokens.semantic.json` = fonte para engenharia (espelhada em `packages/ui/src/theme.css`) |
| `05_UI_DESIGN_SYSTEM`      | style guide, regras de uso da marca, tom de voz                                           |
| `06_SCREEN_BLUEPRINTS`     | inventário de telas, mapa de navegação, specs responsivas                                 |
| `07_IMPLEMENTATION_NEXTJS` | screenshots da prévia e snippets orientativos (não copiar às cegas)                       |
| `08_CLAUDE_CODE_HANDOFF`   | handoff para o agente e Git Flow (já alinhados ao `CLAUDE.md`)                            |
| `09_QA_ACCESSIBILITY`      | auditoria de contraste e critérios de QA visual                                           |

**Fora do repositório (público):** o brand book em PDF (`11_BRAND_BOOK`, 5 MB), as referências geradas por IA (`10_REFERENCES`; a aprovada já está em `docs/references/`), a cópia do PRD (`12_PRD_PROJECT_CONTEXT`, idêntica a `docs/`) e o demo HTML. Os arquivos versionados batem com o `v2/MANIFEST_SHA256.json` do kit (58 conferidos, 0 divergências).

**Onde a marca aparece no app:** `apps/web/public/brand/` (símbolo e logotipo otimizados), `apps/web/src/app/{favicon.ico,icon.png,apple-icon.png,opengraph-image.png,manifest.ts}`, `apps/web/src/shared/ui/brand-mark.tsx` e a rota interna `/design#marca`.

**Ainda pendente (P-006):** fotografias reais autorizadas, master vetorial do símbolo 3D (só um designer pode redesenhar), registro de marca e homologação final de HEX e fontes pela Ellen.

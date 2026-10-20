import type { Metadata } from 'next';

import {
  ButtonsSample,
  CardsSample,
  LayoutsSample,
  StatesSample,
} from '@/modules/design-system/presentation/components';
import {
  ColorSwatches,
  ContrastTable,
  Section,
  SpacingSample,
  TypographySample,
} from '@/modules/design-system/presentation/foundations';
import { PreviewHeader } from '@/shared/ui/preview-header';

export const metadata: Metadata = { title: 'Design system · Caixa Forte' };

/** Style guide vivo (CF-170): tokens e padrões v1.1 renderizados com o CSS real do produto. */
export default function DesignPage() {
  return (
    <>
      <PreviewHeader active="/design" />
      <main className="mx-auto flex max-w-(--spacing-content-max) flex-col gap-12 px-4 py-12 sm:px-8">
        <div className="flex flex-col gap-3">
          <p className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase">
            Design system v1.1
          </p>
          <h1 className="font-editorial text-5xl font-semibold text-cf-sidebar">
            Minimalista, editorial, acolhedor
          </h1>
          <p className="max-w-[65ch] text-cf-text-secondary">
            Tokens e componentes de <code>@caixa-forte/ui</code>, com valores{' '}
            <strong className="font-medium text-cf-text">propostos</strong> em{' '}
            <code>packages/ui/src/theme.css</code>, pendentes de homologação da Ellen (HEX, logo e
            fontes — P-006). Mudanças de paleta ou tipografia passam pelo Decision Log.
          </p>
        </div>

        <Section
          id="cores"
          title="Cores"
          description="Componentes usam só os tokens semânticos (cf-*). A paleta base existe para compor os semânticos e detalhes pontuais."
        >
          <ColorSwatches />
        </Section>

        <Section
          id="contraste"
          title="Contraste (WCAG 2.2 AA)"
          description="Calculado a partir dos tokens. O acento champagne não serve como cor de texto — usar só em ícones grandes e detalhes."
        >
          <ContrastTable />
        </Section>

        <Section
          id="tipografia"
          title="Tipografia"
          description="Serifada apenas em títulos editoriais. Números, preços, códigos e tabelas sempre em sans."
        >
          <TypographySample />
        </Section>

        <Section
          id="espacamento"
          title="Espaçamento e composição"
          description="Base de 4 e 8px, muito respiro entre seções, raio suave nos cards."
        >
          <SpacingSample />
        </Section>

        <Section
          id="layouts"
          title="Layouts"
          description="Três shells de @caixa-forte/ui. Membro e equipe dividem o AppShell; o público usa o PublicShell."
        >
          <LayoutsSample />
        </Section>

        <Section
          id="botoes"
          title="Botões"
          description="Um CTA principal por seção. Todo botão tem ação, navegação ou estado desabilitado com motivo."
        >
          <ButtonsSample />
        </Section>

        <Section
          id="cards"
          title="Cards"
          description="Borda fina ou sombra suave, nunca as duas intensas. Sem microcards nem badges concorrentes."
        >
          <CardsSample />
        </Section>

        <Section
          id="estados"
          title="Estados de tela"
          description="Toda tela trata carregando, vazio, erro e sem permissão — com mensagens verdadeiras."
        >
          <StatesSample />
        </Section>
      </main>
    </>
  );
}

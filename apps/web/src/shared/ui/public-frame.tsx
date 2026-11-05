import { PublicShell } from '@caixa-forte/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrandMark } from './brand-mark';

/**
 * Moldura pública: marca + conteúdo + rodapé. Usada pelo layout público e pelas telas de
 * erro/404 da raiz (CF-157), que ficam fora dos grupos de rota. "Entrar" e "Assinar" entram com
 * as telas reais (CF-030, CF-042): botão sem destino não aparece (doc G §5).
 */
export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <PublicShell
      brand={
        <Link href="/" aria-label="Caixa Forte — página inicial">
          <BrandMark priority />
        </Link>
      }
      footer={<p>Caixa Forte · educação e networking para advogados.</p>}
    >
      {children}
    </PublicShell>
  );
}

import { BrandMark, PublicShell } from '@caixa-forte/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Layout público (landing, planos, `/eventos/[slug]`). "Entrar" e "Assinar" entram com as telas
 * reais (CF-030, CF-042): botão sem destino não aparece (doc G §5).
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicShell
      brand={
        <Link href="/" aria-label="Caixa Forte — página inicial">
          <BrandMark tone="on-light" />
        </Link>
      }
      footer={<p>Caixa Forte · educação e networking para advogados.</p>}
    >
      {children}
    </PublicShell>
  );
}

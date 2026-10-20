import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { isPreviewEnabled } from '@/shared/config/preview';

export const metadata: Metadata = {
  title: 'Preview · Caixa Forte',
  robots: { index: false, follow: false },
};

// Lido a cada requisição: o mesmo build serve staging (com preview) e produção (sem).
export const dynamic = 'force-dynamic';

/** Grupo das rotas internas (/prototipo, /design, /status): bloqueado em produção. */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  if (!isPreviewEnabled(process.env)) notFound();
  return children;
}

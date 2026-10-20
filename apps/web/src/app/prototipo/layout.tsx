import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { isPrototypeEnabled } from '@/shared/config/prototype';

export const metadata: Metadata = {
  title: 'Protótipo · Caixa Forte',
  robots: { index: false, follow: false },
};

// Lido a cada requisição: o mesmo build serve staging (com protótipo) e produção (sem).
export const dynamic = 'force-dynamic';

export default function PrototypeLayout({ children }: { children: ReactNode }) {
  if (!isPrototypeEnabled(process.env)) notFound();
  return children;
}

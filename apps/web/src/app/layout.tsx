import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import './globals.css';

// Fontes PROPOSTAS (R-004, pendente de homologação): serifada só em títulos editoriais.
const editorial = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const sans = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Caixa Forte',
  description: 'Comunidade de educação e networking para advogados.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${editorial.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-cf-bg font-sans text-cf-text antialiased">{children}</body>
    </html>
  );
}

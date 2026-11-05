import type { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';

// Fontes do Brand System V2 (D-014): Playfair Display nos títulos editoriais, Inter na UI.
// Hospedadas no repo (SIL OFL 1.1, licenças em src/shared/fonts) para o build não depender de rede.
const editorial = localFont({
  src: [
    { path: '../shared/fonts/playfair-display-latin-wght.woff2', style: 'normal' },
    { path: '../shared/fonts/playfair-display-latin-wght-italic.woff2', style: 'italic' },
  ],
  weight: '400 900',
  variable: '--font-playfair',
  display: 'swap',
});

const sans = localFont({
  src: '../shared/fonts/inter-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Caixa Forte',
  applicationName: 'Caixa Forte',
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

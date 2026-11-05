import type { MetadataRoute } from 'next';

/** Ícones do Brand System V2 (`docs/brand/v2/03_FAVICONS_APP_ICONS`), servidos de `public/brand`. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Caixa Forte',
    short_name: 'Caixa Forte',
    description: 'Comunidade de educação e networking para advogados.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f3',
    theme_color: '#321927',
    icons: [
      { src: '/brand/app-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/app-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/brand/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

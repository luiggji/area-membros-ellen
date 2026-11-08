/** Raiz das telas de demonstração: as rotas oficiais da área do membro (CF-177). */
export const DEMO_BASE = '/app';

export function hrefFor(slug: string): string {
  return slug ? `${DEMO_BASE}/${slug}` : DEMO_BASE;
}

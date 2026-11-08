import { EmptyState } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { demoSection } from '@/modules/demo/presentation/demo-routes';
import { findMemberSection } from '@/modules/navigation/domain/member-sections';
import { NavIcon } from '@/modules/navigation/presentation/nav-icon';
import { demoMode } from '@/shared/config/demo';

type Props = { params: Promise<{ secao: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [slug, ...rest] = (await params).secao;
  const section = rest.length === 0 && slug ? findMemberSection(slug) : null;
  return { title: section ? `${section.label} · Caixa Forte` : 'Página não encontrada' };
}

/**
 * Destinos do menu cuja tela ainda não existe (CF-171): mostram o estado vazio verdadeiro da
 * seção, dentro do shell. Qualquer outra rota responde 404 aqui, no layout dinâmico (com nonce),
 * e não pela 404 estática da raiz.
 */
export default async function MemberSectionPage({ params }: Props) {
  const segments = (await params).secao;
  const demo = demoMode() ? demoSection(segments) : null;
  if (demo) return demo;
  const [slug, ...rest] = segments;
  const section = rest.length === 0 && slug ? findMemberSection(slug) : null;
  if (!section) notFound();

  return (
    <EmptyState
      size="page"
      icon={<NavIcon name={section.icon} className="size-5" />}
      title={section.title}
      description={section.description}
    />
  );
}

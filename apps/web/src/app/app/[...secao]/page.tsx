import { EmptyState } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { findMemberSection } from '@/modules/navigation/domain/member-sections';
import { NavIcon } from '@/modules/navigation/presentation/nav-icon';

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
  const [slug, ...rest] = (await params).secao;
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

import { notFound } from 'next/navigation';

import { demoAdminScreen } from '@/modules/demo/presentation/team-routes';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { findAdminDemo } from '@/modules/navigation/domain/admin-nav';
import { demoMode } from '@/shared/config/demo';

type Props = {
  params: Promise<{ rest: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Rotas ainda inexistentes desta área respondem 404 dentro do layout dinâmico (com nonce), e não
 * pela 404 estática da raiz. A portaria vem antes: equipe sem MFA vai ao /admin/mfa.
 * No modo demonstração (CF-177), as telas novas do painel aparecem aqui para o papel com a
 * permissão do item; qualquer outro caminho continua 404.
 */
export default async function AdminSectionPage({ params, searchParams }: Props) {
  const { roles } = await requireAdminPanel();
  const [slug, ...more] = (await params).rest;
  const item = demoMode() && slug && more.length === 0 ? findAdminDemo(slug, roles) : undefined;
  const screen = item ? demoAdminScreen(item.slug, await searchParams) : null;
  if (!screen) notFound();
  return screen;
}

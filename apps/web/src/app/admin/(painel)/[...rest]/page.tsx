import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

/**
 * Rotas ainda inexistentes desta área respondem 404 dentro do layout dinâmico (com nonce), e não
 * pela 404 estática da raiz. A portaria vem antes: equipe sem MFA vai ao /admin/mfa.
 */
export default async function NotFoundInPrivateArea(): Promise<never> {
  await requireAdminPanel();
  notFound();
}

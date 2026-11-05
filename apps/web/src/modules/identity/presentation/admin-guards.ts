import { notFound, redirect } from 'next/navigation';

import { loadAdminGate } from '../infrastructure/admin-gate';

/**
 * Portaria do /admin (CF-034). Toda página, loader e Server Action da área chama um destes:
 * layouts não bastam, porque uma navegação RSC pode pedir só o segmento da página e o Next não
 * re-renderiza os layouts que o cliente diz já ter.
 */

/** Equipe, com ou sem segundo fator (tela do MFA e suas actions). */
export async function requireStaff() {
  const gate = await loadAdminGate();
  if (gate.access === 'login') redirect('/entrar?next=/admin');
  if (gate.access === 'not_found') notFound();
  return gate;
}

/** Equipe com sessão `aal2`: tudo dentro de `admin/(painel)`. */
export async function requireAdminPanel() {
  const gate = await requireStaff();
  if (gate.access !== 'allow') redirect('/admin/mfa');
  return gate;
}

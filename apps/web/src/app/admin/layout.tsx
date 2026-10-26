import { notFound, redirect } from 'next/navigation';

import { loadAdminGate } from '@/modules/identity/infrastructure/admin-gate';

/**
 * Área da equipe (CF-034): sem login vai para /entrar; quem não é da equipe recebe 404 (o painel
 * nem "existe" para membros). O MFA é exigido no grupo (painel); /admin/mfa fica fora dele.
 * Ler a sessão deixa tudo dinâmico, então o nonce da CSP chega aos scripts (CF-152).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { access } = await loadAdminGate();
  if (access === 'login') redirect('/entrar?next=/admin');
  if (access === 'not_found') notFound();
  return children;
}

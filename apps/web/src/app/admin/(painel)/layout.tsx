import { redirect } from 'next/navigation';

import { loadAdminGate } from '@/modules/identity/infrastructure/admin-gate';

/** Painel da equipe: só com o segundo fator verificado nesta sessão (CF-034). */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { access } = await loadAdminGate();
  if (access !== 'allow') redirect('/admin/mfa');
  return children;
}

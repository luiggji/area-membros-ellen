import { redirect } from 'next/navigation';

import { getSessionUser } from '@/shared/lib/supabase/session';

/**
 * Área do membro:
 * - exige sessão válida no Auth (CF-030). O proxy já redireciona guardando o destino; esta
 *   checagem é a defesa em profundidade no servidor;
 * - renderizada por requisição (ler a sessão é dinâmico), para o nonce da CSP chegar aos scripts
 *   (CF-152). O shell real do membro entra no CF-101.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/entrar');
  return children;
}

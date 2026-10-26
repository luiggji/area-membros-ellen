import { requireStaff } from '@/modules/identity/presentation/admin-guards';

/**
 * Área da equipe (CF-034): sem login vai para /entrar; quem não é da equipe recebe 404 (o painel
 * nem "existe" para membros). O MFA é exigido no grupo (painel); /admin/mfa fica fora dele.
 * O layout é só a primeira barreira: cada página repete a portaria (ver `admin-guards`).
 * Ler a sessão deixa tudo dinâmico, então o nonce da CSP chega aos scripts (CF-152).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return children;
}

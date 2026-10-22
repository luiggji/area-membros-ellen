import { connection } from 'next/server';

/**
 * Área da equipe (CF-152): sempre renderizada por requisição, para o nonce da CSP (proxy.ts) chegar aos
 * scripts; página estática aqui ficaria sem nonce e com o JavaScript bloqueado. O layout real
 * entra no CF-032/CF-034 mantendo o `await connection()` (ou outra API dinâmica).
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  await connection();
  return children;
}

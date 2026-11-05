import type { Role } from '@caixa-forte/contracts';

/** Nome de cada papel na interface (neutro em gênero; PRD §5). */
export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Gestão (owner)',
  commercial: 'Comercial',
  tech: 'Equipe técnica',
  member: 'Membro',
};

/** Papéis da equipe primeiro e `member` por último: "Gestão (owner) · Membro". */
export function describeRoles(roles: readonly Role[]): string {
  const order: Role[] = ['owner', 'commercial', 'tech', 'member'];
  return order
    .filter((role) => roles.includes(role))
    .map((role) => ROLE_LABELS[role])
    .join(' · ');
}

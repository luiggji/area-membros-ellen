import { z } from 'zod';

import { type Role, roleSchema } from './roles.js';

/**
 * Permissões efetivas por papel (CF-032, PRD CF-12). A API decide por permissão, nunca por
 * papel solto; a UI só reflete (esconder botão não protege nada).
 */
export const PERMISSIONS = [
  'admin.access', // entrar no painel /admin
  'content.manage', // cursos, materiais, regras de conteúdo
  'events.manage', // edições, lotes e capacidade do Café
  'prices.manage', // planos e price_versions (novas compras)
  'access.grant', // concessão manual de acesso pago, com validade e motivo (CF-048)
  'roles.manage', // conceder/revogar papéis da equipe
  'finance.read', // relatórios financeiros e de conversão
  'refunds.manage', // reembolso delegado ao gateway
  'tickets.support', // ver inscrições, reenviar confirmação, dados mínimos
  'checkin.perform', // validar ingresso no Café
  'tech.config', // configuração técnica (deploy/QA), sem dados financeiros
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const permissionSchema = z.enum(PERMISSIONS);

const MATRIX: Record<Role, readonly Permission[]> = {
  // Ellen: tudo do negócio; configuração técnica não é tarefa dela.
  owner: [
    'admin.access',
    'content.manage',
    'events.manage',
    'prices.manage',
    'access.grant',
    'roles.manage',
    'finance.read',
    'refunds.manage',
    'tickets.support',
    'checkin.perform',
  ],
  // Comercial: atendimento e check-in; sem planos, financeiro, papéis ou conteúdo editorial.
  commercial: ['admin.access', 'tickets.support', 'checkin.perform'],
  // Técnico (Luiggi): configuração técnica; sem financeiro por padrão e sem herdar o owner.
  tech: ['admin.access', 'tech.config'],
  // Membro: nada administrativo (o que ele acessa de conteúdo é entitlement, CF-046).
  member: [],
};

/** Permissões somadas de todos os papéis do usuário. */
export function permissionsFor(roles: readonly Role[]): Permission[] {
  return [...new Set(roles.flatMap((role) => MATRIX[role]))];
}

export function can(roles: readonly Role[], permission: Permission): boolean {
  return roles.some((role) => MATRIX[role].includes(permission));
}

/** Resposta de `GET /api/v1/me`: quem é, com quais papéis e o que pode. Sem e-mail nem PII. */
export const meResponseSchema = z.object({
  userId: z.uuid(),
  roles: z.array(roleSchema),
  permissions: z.array(permissionSchema),
});

export type MeResponse = z.infer<typeof meResponseSchema>;

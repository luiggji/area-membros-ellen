import { z } from 'zod';

/**
 * Concessão manual de acesso pago (CF-048): só o owner, com motivo e validade. O dia de validade
 * vale até 23:59 no horário de Brasília.
 */
export const grantAccessRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Informe um e-mail válido.')),
  validUntil: z.iso.date('Informe a data de validade.'),
  reason: z
    .string()
    .trim()
    .min(3, 'Descreva o motivo (mínimo 3 caracteres).')
    .max(300, 'Motivo com até 300 caracteres.'),
});

export type GrantAccessRequest = z.infer<typeof grantAccessRequestSchema>;

export const accessGrantSchema = z.object({
  id: z.uuid(),
  memberEmail: z.string(),
  reason: z.string(),
  validFrom: z.string(),
  validTo: z.string(),
  revokedAt: z.string().nullable(),
});

export type AccessGrant = z.infer<typeof accessGrantSchema>;

export const accessGrantListSchema = z.object({ grants: z.array(accessGrantSchema) });

export type AccessGrantList = z.infer<typeof accessGrantListSchema>;

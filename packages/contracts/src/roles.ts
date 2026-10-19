import { z } from 'zod';

/** Papéis do RBAC (PRD §8.1 `user_roles`). Autorização sempre validada no servidor. */
export const roleSchema = z.enum(['owner', 'commercial', 'tech', 'member']);

export type Role = z.infer<typeof roleSchema>;

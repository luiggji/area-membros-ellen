import { cache } from 'react';

import { createSupabaseServerClient } from '@/shared/lib/supabase/server';
import { getSessionUser } from '@/shared/lib/supabase/session';

import { adminAccess } from '../domain/admin-access';
import { getSessionRoles } from './session-roles';
import { loadMfaStatus } from './supabase-mfa';

/**
 * Tudo que a portaria do /admin precisa, lido no servidor a cada requisição (CF-034). `cache` evita
 * repetir as consultas entre os layouts e a página da mesma requisição.
 */
export const loadAdminGate = cache(async () => {
  const user = await getSessionUser();
  if (!user) {
    return { access: 'login' as const, user: null, roles: [], verifiedFactorId: null };
  }
  const [roles, mfa] = await Promise.all([
    getSessionRoles(),
    loadMfaStatus(await createSupabaseServerClient()),
  ]);
  const access = adminAccess({
    signedIn: true,
    roles,
    aal: mfa.aal,
    hasVerifiedFactor: mfa.verifiedFactorId !== null,
  });
  return { access, user, roles, verifiedFactorId: mfa.verifiedFactorId };
});

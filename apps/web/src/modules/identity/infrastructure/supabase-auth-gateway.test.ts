import { describe, expect, it } from 'vitest';

import { toAuthFailure } from './supabase-auth-gateway';

describe('toAuthFailure', () => {
  it('sem erro é sucesso', () => {
    expect(toAuthFailure(null)).toBeNull();
  });

  it('traduz os códigos do Supabase Auth', () => {
    expect(toAuthFailure({ code: 'invalid_credentials', status: 400 })).toBe('invalid_credentials');
    expect(toAuthFailure({ code: 'email_not_confirmed', status: 400 })).toBe('email_not_confirmed');
    expect(toAuthFailure({ code: 'weak_password', status: 422 })).toBe('weak_password');
    expect(toAuthFailure({ code: 'same_password', status: 422 })).toBe('same_password');
    expect(toAuthFailure({ code: 'session_not_found', status: 403 })).toBe('session_missing');
  });

  it('limite de tentativas vira rate_limited, pelo status ou pelo código', () => {
    expect(toAuthFailure({ status: 429 })).toBe('rate_limited');
    expect(toAuthFailure({ code: 'over_email_send_rate_limit', status: 400 })).toBe('rate_limited');
  });

  it('e-mail já cadastrado não vira erro (sem enumeração de contas)', () => {
    expect(toAuthFailure({ code: 'user_already_exists', status: 422 })).toBeNull();
    expect(toAuthFailure({ code: 'email_exists', status: 422 })).toBeNull();
  });

  it('qualquer outro erro é genérico', () => {
    expect(toAuthFailure({ code: 'unexpected_failure', status: 500 })).toBe('unknown');
    expect(toAuthFailure({})).toBe('unknown');
  });
});

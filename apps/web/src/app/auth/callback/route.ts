import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { safeNext } from '@/modules/identity/domain/safe-redirect';
import { createSupabaseServerClient } from '@/shared/lib/supabase/server';

/**
 * Retorno dos links de e-mail (CF-030): confirmação de cadastro e recuperação de senha. Troca o
 * código (PKCE) ou o token_hash por sessão e segue para `next` (só caminho interno). Link
 * inválido ou expirado volta ao login com aviso, sem detalhe técnico.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get('next'));
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('link sem código') };

  const destination = error ? '/entrar?erro=link' : next;
  return NextResponse.redirect(new URL(destination, url.origin));
}

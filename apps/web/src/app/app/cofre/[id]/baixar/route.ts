import { type NextRequest, NextResponse } from 'next/server';

import { requestDownload } from '@/modules/materials/infrastructure/materials-api';

/**
 * Download do Cofre (CF-085): pede à API um link assinado de 60 s e redireciona para ele na hora.
 * O link nunca fica na página; sem acesso pago, volta ao Cofre com o aviso.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requestDownload((await params).id);
  if (typeof result === 'object') {
    const response = NextResponse.redirect(result.url, 303);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }
  const back = new URL('/app/cofre', request.url);
  back.searchParams.set(
    'aviso',
    result === 'forbidden' ? 'assinatura' : result === 'not_found' ? 'removido' : 'erro',
  );
  return NextResponse.redirect(back, 303);
}

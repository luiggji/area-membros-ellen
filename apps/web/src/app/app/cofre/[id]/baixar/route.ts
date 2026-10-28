import { type NextRequest, NextResponse } from 'next/server';

import { requestDownload } from '@/modules/materials/infrastructure/materials-api';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Download do Cofre (CF-085): pede à API um link assinado de 60 s e redireciona para ele na hora.
 * O link nunca fica na página; sem acesso pago, volta ao Cofre com o aviso.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = UUID.test(id) ? await requestDownload(id) : 'not_found';
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

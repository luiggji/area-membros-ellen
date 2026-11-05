import { buttonClasses, ErrorState } from '@caixa-forte/ui';
import { Compass } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Página não encontrada · Caixa Forte' };

/** 404 padrão (CF-157): rota inexistente, inclusive dentro de /app e /admin (renderizada com nonce). */
export default function NotFound() {
  return (
    <PublicFrame>
      <ErrorState
        size="page"
        code="Erro 404"
        icon={<Compass className="size-5" />}
        title="Página não encontrada"
        description="O endereço pode ter mudado ou não existe mais."
        action={
          <Link href="/" className={buttonClasses()}>
            Voltar ao início
          </Link>
        }
      />
    </PublicFrame>
  );
}

'use client';

import { Button, ErrorState } from '@caixa-forte/ui';
import { AlertTriangle } from 'lucide-react';

import { errorReference } from '@/shared/lib/error-reference';
import { PublicFrame } from '@/shared/ui/public-frame';

/**
 * Erro inesperado numa rota (CF-157). Nunca mostra a mensagem técnica; oferece tentar de novo
 * (`retry` refaz a busca do segmento, Next 16.2+) e o código para o suporte.
 */
export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <PublicFrame>
      <ErrorState
        size="page"
        icon={<AlertTriangle className="size-5" />}
        title="Não foi possível carregar esta página."
        description="Tente novamente. Se continuar, fale com o suporte informando o código abaixo."
        reference={errorReference(error)}
        action={<Button onClick={() => retry()}>Tentar novamente</Button>}
      />
    </PublicFrame>
  );
}

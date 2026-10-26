import { EmptyState } from '@caixa-forte/ui';
import { Coffee } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Café Estratégico · Caixa Forte',
  description: 'Encontros presenciais do Café Estratégico.',
};

/**
 * Café Estratégico (destino público do menu, CF-171): sem evento com inscrições abertas, diz isso.
 * A vitrine real de eventos, com lotes e ingresso, chega com a bilheteria (Onda 5).
 */
export default function EventsPage() {
  return (
    <div className="py-16">
      <EmptyState
        size="page"
        icon={<Coffee className="size-5" />}
        title="Nenhum Café Estratégico com inscrições abertas"
        description="Os próximos encontros presenciais aparecem aqui, com cidade, data e ingressos."
      />
    </div>
  );
}

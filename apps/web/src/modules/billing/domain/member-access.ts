/** Acesso vigente como o banco decide (`my_access`, CF-046); `null` = sem acesso pago. */
export interface MemberAccess {
  source: 'subscription' | 'manual';
  subscriptionStatus: string | null;
  validUntil: string | null;
}

export interface AccessSummary {
  title: string;
  description: string;
  active: boolean;
}

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** Texto verdadeiro do estado de acesso para a tela Assinatura; sem data, não promete data. */
export function describeAccess(access: MemberAccess | null): AccessSummary {
  if (!access) {
    return {
      active: false,
      title: 'Você ainda não tem acesso de assinante',
      description:
        'As assinaturas ainda não estão abertas. Quando abrirem, você acompanha aqui o seu plano e as cobranças.',
    };
  }
  const until = access.validUntil ? date.format(new Date(access.validUntil)) : null;
  if (access.source === 'manual') {
    return {
      active: true,
      title: 'Acesso liberado pela equipe',
      description: until ? `Seu acesso vale até ${until}.` : 'Seu acesso está liberado.',
    };
  }
  switch (access.subscriptionStatus) {
    case 'cancel_at_period_end':
      return {
        active: true,
        title: 'Cancelamento agendado',
        description: until
          ? `Seu acesso continua até ${until}.`
          : 'Seu acesso continua até o fim do período pago.',
      };
    case 'past_due':
      return {
        active: true,
        title: 'Pagamento pendente',
        description: until
          ? `A última cobrança não foi confirmada. Seu acesso vale até ${until}.`
          : 'A última cobrança não foi confirmada.',
      };
    default:
      return {
        active: true,
        title: 'Assinatura ativa',
        description: until ? `Próxima renovação em ${until}.` : 'Sua assinatura está ativa.',
      };
  }
}

'use client';

import { Button, Notice } from '@caixa-forte/ui';
import { useActionState } from 'react';

import type { FormState } from '../application/auth-use-cases';
import type { PolicyWithConsent } from '../infrastructure/supabase-profile';
import { acceptPolicyAction, revokeConsentAction } from './profile-actions';

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});
const idle: FormState = { status: 'idle' };

function PolicyRow({ policy }: { policy: PolicyWithConsent }) {
  const [accepted, accept] = useActionState(acceptPolicyAction, idle);
  const [revoked, revoke] = useActionState(revokeConsentAction, idle);
  const feedback = [accepted, revoked].find((s) => s.status !== 'idle');

  return (
    <li className="flex flex-col gap-3 border-t border-cf-border py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-cf-text">{policy.title}</p>
          <p className="text-xs text-cf-text-secondary">
            Versão {policy.version}
            {policy.consent
              ? ` · aceita em ${date.format(new Date(policy.consent.acceptedAt))}`
              : ' · ainda não aceita'}
          </p>
        </div>
        {policy.consent ? (
          <form action={revoke}>
            <input type="hidden" name="consentId" value={policy.consent.id} />
            <Button type="submit" variant="secondary">
              Revogar
            </Button>
          </form>
        ) : (
          <form action={accept}>
            <input type="hidden" name="policyVersionId" value={policy.id} />
            <Button type="submit">Li e aceito</Button>
          </form>
        )}
      </div>
      {feedback?.message ? (
        <Notice tone={feedback.status === 'error' ? 'danger' : 'info'}>{feedback.message}</Notice>
      ) : null}
    </li>
  );
}

/**
 * Termos, privacidade e consentimentos (CF-031). Sem versão publicada (P-012 pendente), diz isso
 * com clareza em vez de mostrar texto provisório com cara de definitivo.
 */
export function PoliciesSection({ policies }: { policies: PolicyWithConsent[] }) {
  if (policies.length === 0) {
    return (
      <Notice>
        Os termos de uso e a política de privacidade estão em revisão jurídica. Quando forem
        publicados, você poderá lê-los e aceitá-los aqui.
      </Notice>
    );
  }
  return (
    <ul className="flex flex-col">
      {policies.map((policy) => (
        <PolicyRow key={policy.id} policy={policy} />
      ))}
    </ul>
  );
}

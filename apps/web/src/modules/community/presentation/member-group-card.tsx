'use client';

import type { MemberGroup } from '@caixa-forte/contracts';
import { Button, Card, Notice } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { MembershipState } from '../application/membership-use-cases';
import { joinGroupAction, leaveGroupAction } from './membership-actions';

function Submit({ joined }: { joined: boolean }) {
  const { pending } = useFormStatus();
  const idle = joined ? 'Sair' : 'Participar';
  return (
    <Button
      type="submit"
      variant={joined ? 'ghost' : 'secondary'}
      disabled={pending}
      aria-busy={pending}
      className="shrink-0"
    >
      {pending ? 'Salvando…' : idle}
    </Button>
  );
}

/** Número real, do banco. Nunca "cerca de" nem estimativa (mandamento 5). */
function participantes(total: number): string {
  if (total === 0) return 'Ninguém participa ainda';
  return total === 1 ? '1 participante' : `${total} participantes`;
}

/** Um grupo na aba Grupos: o que é, quantos participam e o botão de entrar ou sair. */
export function MemberGroupCard({ group }: { group: MemberGroup }) {
  const [state, formAction] = useActionState<MembershipState, FormData>(
    group.joined ? leaveGroupAction : joinGroupAction,
    { status: 'idle' },
  );

  return (
    <Card as="li" className="flex flex-col gap-3">
      <form action={formAction} className="flex flex-wrap items-center gap-4">
        <input type="hidden" name="groupId" value={group.id} />
        <input type="hidden" name="groupName" value={group.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-medium text-cf-text">{group.name}</p>
          {group.description && (
            <p className="text-sm text-cf-text-secondary">{group.description}</p>
          )}
          <p className="text-sm text-cf-text-secondary">
            {participantes(group.memberCount)}
            {group.joined && ' · você participa'}
          </p>
        </div>
        <Submit joined={group.joined} />
      </form>
      {state.status === 'error' && <Notice tone="danger">{state.message}</Notice>}
      {state.status === 'success' && <Notice>{state.message}</Notice>}
    </Card>
  );
}

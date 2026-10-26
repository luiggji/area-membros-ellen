'use client';

import { Button } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { revokeGrantAction } from './grant-actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" disabled={pending} aria-busy={pending}>
      {pending ? 'Revogando…' : 'Revogar'}
    </Button>
  );
}

/** Revoga uma concessão; recusa da API aparece ao lado, em vez de falhar em silêncio. */
export function RevokeGrantButton({ id }: { id: string }) {
  const [state, action] = useActionState(revokeGrantAction, {});
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <Submit />
      {state.error ? (
        <span role="alert" className="text-xs text-danger">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

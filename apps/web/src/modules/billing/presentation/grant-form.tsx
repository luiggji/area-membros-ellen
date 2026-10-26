'use client';

import { Button, Notice, TextAreaField, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { GrantFormState } from '../application/grant-use-cases';
import { grantAccessAction } from './grant-actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Concedendo…' : 'Conceder acesso'}
    </Button>
  );
}

/** Concessão manual (CF-048): e-mail da conta, validade e motivo, todos obrigatórios. */
export function GrantForm({ minDate }: { minDate: string }) {
  const [state, action] = useActionState<GrantFormState, FormData>(grantAccessAction, {
    status: 'idle',
  });
  const error = (field: string) =>
    state.status === 'error' ? state.fieldErrors?.[field] : undefined;
  const value = (field: string) => (state.status === 'error' ? state.values?.[field] : undefined);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.status === 'error' && state.message ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : null}
      {state.status === 'success' ? <Notice>{state.message}</Notice> : null}
      <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
        <TextField
          name="email"
          type="email"
          label="E-mail da conta"
          autoComplete="off"
          required
          defaultValue={value('email')}
          error={error('email')}
        />
        <TextField
          name="validUntil"
          type="date"
          label="Válido até"
          min={minDate}
          required
          defaultValue={value('validUntil')}
          error={error('validUntil')}
        />
      </div>
      <TextAreaField
        name="reason"
        label="Motivo"
        helper="Fica registrado na trilha de auditoria. Não inclua dados de clientes."
        maxLength={300}
        required
        defaultValue={value('reason')}
        error={error('reason')}
      />
      <div>
        <Submit />
      </div>
    </form>
  );
}

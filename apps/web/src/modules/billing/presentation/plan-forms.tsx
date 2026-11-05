'use client';

import type { AdminPlan } from '@caixa-forte/contracts';
import { Button, Notice, SelectField, TextAreaField, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { CatalogFormState } from '../application/plan-use-cases';
import { createPlanAction, publishPriceAction, updatePlanAction } from './plan-actions';

function Submit({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} aria-busy={status.pending}>
      {status.pending ? pending : idle}
    </Button>
  );
}

function useCatalogForm(
  action: (state: CatalogFormState, form: FormData) => Promise<CatalogFormState>,
) {
  const [state, formAction] = useActionState<CatalogFormState, FormData>(action, {
    status: 'idle',
  });
  return {
    state,
    formAction,
    error: (field: string) => (state.status === 'error' ? state.fieldErrors?.[field] : undefined),
    value: (field: string) => (state.status === 'error' ? state.values?.[field] : undefined),
    notice:
      state.status === 'error' && state.message ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : state.status === 'success' ? (
        <Notice>{state.message}</Notice>
      ) : null,
  };
}

const intervalOptions = [
  { value: 'month', label: 'Mensal' },
  { value: 'year', label: 'Anual' },
];

/** Preço novo para um plano: vale para novas vendas; quem já assina fica no preço contratado. */
export function PublishPriceForm({ planId }: { planId: string }) {
  const form = useCatalogForm(publishPriceAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <input type="hidden" name="planId" value={planId} />
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <SelectField
          name="interval"
          label="Frequência"
          options={intervalOptions}
          defaultValue={form.value('interval') ?? 'month'}
          error={form.error('interval')}
        />
        <TextField
          name="amount"
          label="Novo valor (R$)"
          inputMode="decimal"
          placeholder="89,90"
          autoComplete="off"
          required
          defaultValue={form.value('amount')}
          error={form.error('amount')}
        />
      </div>
      <div>
        <Submit idle="Publicar preço" pending="Publicando…" />
      </div>
    </form>
  );
}

/** Nome, descrição e se o plano está à venda. O código não muda (é a referência do plano). */
export function EditPlanForm({ plan }: { plan: AdminPlan }) {
  const form = useCatalogForm(updatePlanAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <input type="hidden" name="planId" value={plan.id} />
      <TextField
        name="name"
        label="Nome"
        required
        defaultValue={form.value('name') ?? plan.name}
        error={form.error('name')}
      />
      <TextAreaField
        name="description"
        label="Descrição"
        maxLength={500}
        defaultValue={form.value('description') ?? plan.description ?? ''}
        error={form.error('description')}
      />
      <label className="flex min-h-11 items-center gap-3 text-sm text-cf-text">
        <input
          type="checkbox"
          name="active"
          defaultChecked={plan.active}
          className="size-5 accent-cf-primary"
        />
        À venda (plano inativo some da vitrine; quem já assina continua)
      </label>
      <div>
        <Submit idle="Salvar plano" pending="Salvando…" />
      </div>
    </form>
  );
}

export function CreatePlanForm() {
  const form = useCatalogForm(createPlanAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          label="Nome"
          required
          defaultValue={form.value('name')}
          error={form.error('name')}
        />
        <TextField
          name="code"
          label="Código"
          helper="Letras minúsculas, números e hífen. Não muda depois."
          autoComplete="off"
          required
          defaultValue={form.value('code')}
          error={form.error('code')}
        />
      </div>
      <TextAreaField
        name="description"
        label="Descrição"
        maxLength={500}
        defaultValue={form.value('description')}
        error={form.error('description')}
      />
      <div>
        <Submit idle="Criar plano" pending="Criando…" />
      </div>
    </form>
  );
}

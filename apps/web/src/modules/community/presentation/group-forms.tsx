'use client';

import { type AdminGroup, GROUP_STATUSES } from '@caixa-forte/contracts';
import { Button, Notice, SelectField, TextAreaField, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { GroupFormState } from '../application/group-use-cases';
import { createGroupAction, updateGroupAction } from './group-actions';

function Submit({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} aria-busy={status.pending}>
      {status.pending ? pending : idle}
    </Button>
  );
}

function useGroupForm(action: (state: GroupFormState, form: FormData) => Promise<GroupFormState>) {
  const [state, formAction] = useActionState<GroupFormState, FormData>(action, {
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

const statusOptions = Object.entries(GROUP_STATUSES).map(([value, label]) => ({ value, label }));

/** Nome, descrição e — no mesmo lugar — publicar ou ocultar. O identificador não muda. */
export function EditGroupForm({ group }: { group: AdminGroup }) {
  const form = useGroupForm(updateGroupAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <input type="hidden" name="groupId" value={group.id} />
      <TextField
        name="name"
        label="Nome"
        required
        defaultValue={form.value('name') ?? group.name}
        error={form.error('name')}
      />
      <TextAreaField
        name="description"
        label="Descrição"
        helper="O que se discute aqui. Aparece para o membro na lista de grupos."
        maxLength={500}
        defaultValue={form.value('description') ?? group.description ?? ''}
        error={form.error('description')}
      />
      <SelectField
        name="status"
        label="Situação"
        options={statusOptions}
        helper="Só grupo publicado aparece para os membros."
        defaultValue={form.value('status') ?? group.status}
        error={form.error('status')}
      />
      <div>
        <Submit idle="Salvar grupo" pending="Salvando…" />
      </div>
    </form>
  );
}

/** Criar não publica: o grupo nasce em rascunho e você decide quando abrir. */
export function CreateGroupForm() {
  const form = useGroupForm(createGroupAction);
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
          name="slug"
          label="Identificador"
          helper="Letras minúsculas, números e hífen. Vira o endereço do grupo e não muda depois."
          autoComplete="off"
          required
          defaultValue={form.value('slug')}
          error={form.error('slug')}
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
        <Submit idle="Criar grupo" pending="Criando…" />
      </div>
    </form>
  );
}

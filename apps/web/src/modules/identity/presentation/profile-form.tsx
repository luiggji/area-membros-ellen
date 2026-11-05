'use client';

import { BRAZIL_STATES, PROFESSIONAL_STAGES, type ProfessionalStage } from '@caixa-forte/contracts';
import { Button, Notice, SelectField, TextAreaField, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { FormState } from '../application/auth-use-cases';
import type { ProfileRow } from '../infrastructure/supabase-profile';
import { updateProfileAction } from './profile-actions';

const stateOptions = BRAZIL_STATES.map((uf) => ({ value: uf, label: uf }));
const stageOptions = (Object.keys(PROFESSIONAL_STAGES) as ProfessionalStage[]).map((key) => ({
  value: key,
  label: PROFESSIONAL_STAGES[key],
}));

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Salvando…' : 'Salvar perfil'}
    </Button>
  );
}

/** Formulário do próprio perfil (CF-031). Reexibe o que foi digitado se a validação falhar. */
export function ProfileForm({ profile }: { profile: ProfileRow | null }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {
    status: 'idle',
  });
  const error = (field: string) =>
    state.status === 'error' ? state.fieldErrors?.[field] : undefined;
  const initial = (field: keyof ProfileRow) =>
    state.status === 'error' && state.values?.[field] !== undefined
      ? state.values[field]
      : ((profile?.[field] as string | null | undefined) ?? '');

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.status === 'error' && state.message ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : null}
      {state.status === 'success' ? <Notice>{state.message}</Notice> : null}

      <TextField
        name="name"
        label="Nome"
        autoComplete="name"
        required
        defaultValue={initial('name')}
        error={error('name')}
      />
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <TextField
          name="city"
          label="Cidade"
          autoComplete="address-level2"
          defaultValue={initial('city')}
          error={error('city')}
        />
        <SelectField
          name="state"
          label="UF"
          placeholder="—"
          options={stateOptions}
          defaultValue={initial('state')}
          error={error('state')}
        />
      </div>
      <SelectField
        name="professional_stage"
        label="Momento de carreira"
        placeholder="Selecione"
        options={stageOptions}
        defaultValue={initial('professional_stage')}
        error={error('professional_stage')}
      />
      <TextAreaField
        name="bio"
        label="Apresentação curta"
        helper="Até 500 caracteres. Não inclua dados de clientes."
        maxLength={500}
        defaultValue={initial('bio')}
        error={error('bio')}
      />
      <div>
        <Save />
      </div>
    </form>
  );
}

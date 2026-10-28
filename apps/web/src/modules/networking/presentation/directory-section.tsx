'use client';

import { BRAZIL_STATES } from '@caixa-forte/contracts';
import { Button, Notice, SelectField, TextAreaField, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';

import type { FormState } from '@/modules/identity/application/auth-use-cases';
import {
  acceptPolicyAction,
  revokeConsentAction,
} from '@/modules/identity/presentation/profile-actions';
import { LessonBody } from '@/modules/learning/presentation/lesson-body';

import type { DirectoryStatus } from '../application/directory-profile';
import type { DirectoryProfileRow } from '../infrastructure/supabase-directory';
import { saveDirectoryProfileAction } from './directory-actions';

const idle: FormState = { status: 'idle' };

function Feedback({ state }: { state: FormState }) {
  return state.status !== 'idle' && state.message ? (
    <Notice tone={state.status === 'error' ? 'danger' : 'info'}>{state.message}</Notice>
  ) : null;
}

/** Entrar = aceitar o termo publicado; sair = revogar o aceite (sai do diretório na hora). */
function Membership({ status, term }: { status: DirectoryStatus; term: string | null }) {
  const [accepted, accept] = useActionState(acceptPolicyAction, idle);
  const [revoked, revoke] = useActionState(revokeConsentAction, idle);

  if (status.state === 'closed') {
    return (
      <Notice>
        O diretório de membros ainda não abriu. Você já pode preparar seu perfil público; quando o
        termo do diretório for publicado, você escolhe se quer aparecer.
      </Notice>
    );
  }
  if (status.state === 'in') {
    return (
      <div className="flex flex-col gap-3 rounded-(--radius-card) border border-cf-border bg-cf-surface p-5">
        <p className="font-medium text-cf-text">Você aparece no diretório.</p>
        <form action={revoke}>
          <input type="hidden" name="consentId" value={status.consentId} />
          <Button type="submit" variant="secondary">
            Sair do diretório
          </Button>
        </form>
        <Feedback state={revoked} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-(--radius-card) border border-cf-border bg-cf-surface p-5">
      <p className="font-medium text-cf-text">Você não aparece no diretório.</p>
      {term && (
        <details>
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-cf-primary">
            Ler o termo do diretório
          </summary>
          <div className="pt-2 text-sm">
            <LessonBody source={term} />
          </div>
        </details>
      )}
      {status.state === 'needs_profile' ? (
        <p className="text-sm text-cf-text-secondary">
          Salve seu perfil público abaixo para poder entrar.
        </p>
      ) : (
        <form action={accept}>
          <input type="hidden" name="policyVersionId" value={status.policyVersionId} />
          <Button type="submit">Li o termo e quero aparecer</Button>
        </form>
      )}
      <Feedback state={accepted} />
    </div>
  );
}

function ProfileForm({ profile }: { profile: DirectoryProfileRow | null }) {
  const [state, action, pending] = useActionState(saveDirectoryProfileAction, idle);
  const error = (field: string) =>
    state.status === 'error' ? state.fieldErrors?.[field] : undefined;
  const value = (field: string) => (state.status === 'error' ? state.values?.[field] : undefined);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Feedback state={state} />
      <TextField
        name="displayName"
        label="Nome profissional"
        required
        defaultValue={value('displayName') ?? profile?.display_name ?? ''}
        error={error('displayName')}
      />
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem] [&>*]:min-w-0">
        <TextField
          name="city"
          label="Cidade"
          defaultValue={value('city') ?? profile?.city ?? ''}
          error={error('city')}
        />
        <SelectField
          name="state"
          label="UF"
          options={[
            { value: '', label: '—' },
            ...BRAZIL_STATES.map((uf) => ({ value: uf, label: uf })),
          ]}
          defaultValue={value('state') ?? profile?.state ?? ''}
          error={error('state')}
        />
      </div>
      <TextField
        name="areas"
        label="Áreas de atuação"
        helper="Até 5, separadas por vírgula (ex.: Família, Sucessões)."
        defaultValue={value('areas') ?? profile?.areas.join(', ') ?? ''}
        error={error('areas')}
      />
      <TextAreaField
        name="bio"
        label="Apresentação curta"
        maxLength={280}
        defaultValue={value('bio') ?? profile?.bio ?? ''}
        error={error('bio')}
      />
      <TextAreaField
        name="links"
        label="Links (opcional)"
        helper="Até 3, um por linha, começando com https:// (site, LinkedIn). Só o que você quiser mostrar."
        rows={3}
        defaultValue={value('links') ?? profile?.links.join('\n') ?? ''}
        error={error('links')}
      />
      <div>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? 'Salvando…' : 'Salvar perfil público'}
        </Button>
      </div>
    </form>
  );
}

/** Como o perfil aparece para outros assinantes: só estes campos, nada de contato. */
function Preview({ profile }: { profile: DirectoryProfileRow }) {
  const place = [profile.city, profile.state].filter(Boolean).join(' / ');
  return (
    <div className="flex flex-col gap-2 rounded-(--radius-card) border border-dashed border-cf-border p-5">
      <p className="text-xs font-medium tracking-wide text-cf-text-secondary uppercase">
        Como outros assinantes veem
      </p>
      <p className="font-editorial text-xl text-cf-text">{profile.display_name}</p>
      {place && <p className="text-sm text-cf-text-secondary">{place}</p>}
      {profile.areas.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {profile.areas.map((area) => (
            <li
              key={area}
              className="rounded-full bg-cf-surface-muted px-3 py-1 text-xs text-cf-text"
            >
              {area}
            </li>
          ))}
        </ul>
      )}
      {profile.bio && <p className="text-sm text-cf-text-secondary">{profile.bio}</p>}
      {profile.links.length > 0 && (
        <ul className="flex flex-col gap-1">
          {profile.links.map((link) => (
            <li key={link} className="text-sm break-all text-cf-primary">
              {link}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Diretório de membros no perfil (CF-090): perfil público opcional, prévia e entrada/saída pelo
 * termo do diretório. E-mail e telefone nunca aparecem.
 */
export function DirectorySection({
  profile,
  status,
  term,
}: {
  profile: DirectoryProfileRow | null;
  status: DirectoryStatus;
  term: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Membership status={status} term={term} />
      <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
        <ProfileForm profile={profile} />
      </div>
      {profile && <Preview profile={profile} />}
    </div>
  );
}

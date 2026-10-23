'use client';

import { Button, Notice, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import type { FormState } from '../application/auth-use-cases';
import { PASSWORD_RULE } from '../domain/credentials';
import {
  requestPasswordResetAction,
  signInAction,
  signOutAction,
  signUpAction,
  updatePasswordAction,
} from './auth-actions';

const idle: FormState = { status: 'idle' };

function Submit({ children, pendingLabel }: { children: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
      {pending ? pendingLabel : children}
    </Button>
  );
}

function FormNotice({ state }: { state: FormState }) {
  if (state.status === 'error' && state.message)
    return <Notice tone="danger">{state.message}</Notice>;
  if (state.status === 'success') return <Notice>{state.message}</Notice>;
  return null;
}

const fieldError = (state: FormState, field: string) =>
  state.status === 'error' ? state.fieldErrors?.[field] : undefined;
const value = (state: FormState, field: string) =>
  state.status === 'error' ? state.values?.[field] : undefined;

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signInAction, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormNotice state={state} />
      <input type="hidden" name="next" value={next ?? ''} />
      <TextField
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        defaultValue={value(state, 'email')}
        error={fieldError(state, 'email')}
      />
      <TextField
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        error={fieldError(state, 'password')}
      />
      <Submit pendingLabel="Entrando…">Entrar</Submit>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormNotice state={state} />
      <TextField
        name="name"
        label="Nome"
        autoComplete="name"
        required
        defaultValue={value(state, 'name')}
        error={fieldError(state, 'name')}
      />
      <TextField
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        defaultValue={value(state, 'email')}
        error={fieldError(state, 'email')}
      />
      <TextField
        name="password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        required
        helper={PASSWORD_RULE}
        error={fieldError(state, 'password')}
      />
      <Submit pendingLabel="Criando conta…">Criar conta</Submit>
    </form>
  );
}

export function PasswordResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormNotice state={state} />
      <TextField
        name="email"
        label="E-mail da conta"
        type="email"
        autoComplete="email"
        required
        defaultValue={value(state, 'email')}
        error={fieldError(state, 'email')}
      />
      <Submit pendingLabel="Enviando…">Enviar link</Submit>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, idle);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormNotice state={state} />
      <TextField
        name="password"
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        required
        helper={PASSWORD_RULE}
        error={fieldError(state, 'password')}
      />
      <TextField
        name="confirm"
        label="Repita a nova senha"
        type="password"
        autoComplete="new-password"
        required
        error={fieldError(state, 'confirm')}
      />
      <Submit pendingLabel="Salvando…">Salvar nova senha</Submit>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        Sair
      </Button>
    </form>
  );
}

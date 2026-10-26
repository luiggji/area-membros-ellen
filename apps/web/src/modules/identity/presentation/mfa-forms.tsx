'use client';

import { Button, Notice, TextField } from '@caixa-forte/ui';
import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';

import type { MfaState } from '../application/mfa-use-cases';
import { confirmCodeAction, startEnrollmentAction } from './mfa-actions';

function Verify({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Verificando…' : label}
    </Button>
  );
}

function CodeForm({
  factorId,
  state,
  action,
  extra,
  label,
}: {
  factorId: string;
  state: MfaState;
  action: (form: FormData) => void;
  extra?: { qrCode: string; secret: string };
  label: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.status === 'error' ? <Notice tone="danger">{state.message}</Notice> : null}
      <input type="hidden" name="factorId" value={factorId} />
      {extra ? (
        <>
          <input type="hidden" name="qrCode" value={extra.qrCode} />
          <input type="hidden" name="secret" value={extra.secret} />
        </>
      ) : null}
      <TextField
        name="code"
        label="Código de 6 dígitos do app autenticador"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={7}
        required
      />
      <div>
        <Verify label={label} />
      </div>
    </form>
  );
}

/** Primeiro cadastro do app autenticador: gera o QR, mostra a chave e confirma um código. */
export function MfaEnrollment() {
  const [enrollment, setEnrollment] = useState<MfaState>({ status: 'idle' });
  const [starting, startTransition] = useTransition();
  const [verified, confirm] = useActionState(confirmCodeAction, { status: 'idle' });

  // Depois de um código errado, o QR e a chave voltam no estado da action.
  const current = verified.status === 'error' && verified.factorId ? verified : enrollment;

  if (current.status !== 'enrolling' && !(current.status === 'error' && current.factorId)) {
    return (
      <div className="flex flex-col gap-5">
        {current.status === 'error' ? <Notice tone="danger">{current.message}</Notice> : null}
        <ol className="list-decimal space-y-2 pl-5 text-sm text-cf-text-secondary">
          <li>
            Instale um app autenticador (Google Authenticator, Microsoft Authenticator, 1Password…).
          </li>
          <li>Gere o QR code abaixo e escaneie com o app.</li>
          <li>Digite o código de 6 dígitos que o app mostrar.</li>
        </ol>
        <div>
          <Button
            disabled={starting}
            aria-busy={starting}
            onClick={() =>
              startTransition(async () => setEnrollment(await startEnrollmentAction()))
            }
          >
            {starting ? 'Gerando…' : 'Gerar QR code'}
          </Button>
        </div>
      </div>
    );
  }

  const { factorId, qrCode, secret } = current as {
    factorId: string;
    qrCode: string;
    secret: string;
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        {/* O QR é um SVG em data: URL gerado pelo Supabase; a CSP já permite img data:. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrCode}
          alt="QR code para cadastrar a Caixa Forte no app autenticador"
          width={176}
          height={176}
          className="rounded-xl border border-cf-border bg-white p-2"
        />
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-cf-text-secondary">Não consegue escanear? Digite esta chave no app:</p>
          <code className="break-all rounded-lg bg-cf-surface-muted px-3 py-2 font-mono text-cf-text">
            {secret}
          </code>
        </div>
      </div>
      <CodeForm
        factorId={factorId}
        state={verified}
        action={confirm}
        extra={{ qrCode, secret }}
        label="Ativar verificação em duas etapas"
      />
    </div>
  );
}

/** Login da equipe com o fator já cadastrado: só o código. */
export function MfaVerification({ factorId }: { factorId: string }) {
  const [state, confirm] = useActionState(confirmCodeAction, { status: 'idle' });
  return <CodeForm factorId={factorId} state={state} action={confirm} label="Verificar" />;
}

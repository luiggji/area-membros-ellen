import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn.js';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Obrigatório: vira o `id` do input e a base dos ids de ajuda/erro. */
  name: string;
  label: string;
  /** Texto de apoio discreto (ex.: regra da senha). */
  helper?: ReactNode;
  /** Erro de validação do campo; liga `aria-invalid` e é lido junto com o campo. */
  error?: string;
}

/**
 * Campo de texto (CF-030, style guide: label visível, helper discreto, validação por campo,
 * altura 44px). Ajuda e erro ficam ligados ao input por `aria-describedby`.
 */
export function TextField({ name, label, helper, error, className, ...input }: TextFieldProps) {
  const helperId = helper ? `${name}-ajuda` : undefined;
  const errorId = error ? `${name}-erro` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={name} className="text-sm font-medium text-cf-text">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-11 rounded-xl border bg-cf-surface px-4 text-base text-cf-text',
          'outline-none focus-visible:ring-2 focus-visible:ring-cf-primary/40',
          error ? 'border-danger' : 'border-cf-border focus-visible:border-cf-primary',
        )}
        {...input}
      />
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {helper ? (
        <p id={helperId} className="text-xs text-cf-text-secondary">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Aviso de formulário: `danger` (erro, role="alert") ou `info` (confirmação, role="status").
 * Frase curta e verdadeira (COPY_TONE), sem expor detalhe técnico.
 */
export function Notice({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'info' | 'danger';
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        tone === 'danger'
          ? 'border-danger/30 bg-danger/5 text-danger'
          : 'border-cf-border bg-cf-surface-muted text-cf-text',
        className,
      )}
    >
      {children}
    </div>
  );
}

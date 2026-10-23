import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '../lib/cn.js';

interface FieldProps {
  /** Obrigatório: vira o `id` do controle e a base dos ids de ajuda/erro. */
  name: string;
  label: string;
  /** Texto de apoio discreto (ex.: regra da senha). */
  helper?: ReactNode;
  /** Erro de validação do campo; liga `aria-invalid` e é lido junto com o campo. */
  error?: string;
}

/** Ids de ajuda/erro e a moldura comum (label visível + erro + ajuda), CF-030/CF-031. */
function fieldIds({ name, helper, error }: FieldProps) {
  const helperId = helper ? `${name}-ajuda` : undefined;
  const errorId = error ? `${name}-erro` : undefined;
  return {
    helperId,
    errorId,
    controlProps: {
      id: name,
      name,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': [errorId, helperId].filter(Boolean).join(' ') || undefined,
    },
  };
}

function FieldShell({
  name,
  label,
  helper,
  error,
  helperId,
  errorId,
  className,
  children,
}: FieldProps & { helperId?: string; errorId?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={name} className="text-sm font-medium text-cf-text">
        {label}
      </label>
      {children}
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

const controlClasses = (error?: string) =>
  cn(
    'rounded-xl border bg-cf-surface px-4 text-base text-cf-text',
    'outline-none focus-visible:ring-2 focus-visible:ring-cf-primary/40',
    error ? 'border-danger' : 'border-cf-border focus-visible:border-cf-primary',
  );

export type TextFieldProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'>;

/**
 * Campo de texto (style guide: label visível, helper discreto, validação por campo, altura 44px).
 * Ajuda e erro ficam ligados ao input por `aria-describedby`.
 */
export function TextField({ name, label, helper, error, className, ...input }: TextFieldProps) {
  const { helperId, errorId, controlProps } = fieldIds({ name, label, helper, error });
  return (
    <FieldShell {...{ name, label, helper, error, helperId, errorId, className }}>
      <input {...controlProps} className={cn('min-h-11', controlClasses(error))} {...input} />
    </FieldShell>
  );
}

export type SelectFieldProps = FieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name'> & {
    options: readonly { value: string; label: string }[];
    /** Primeira opção vazia (ex.: "Selecione"), para campo opcional. */
    placeholder?: string;
  };

/** Lista de opções nativa (acessível por teclado e leitor de tela sem esforço extra). */
export function SelectField({
  name,
  label,
  helper,
  error,
  className,
  options,
  placeholder,
  ...select
}: SelectFieldProps) {
  const { helperId, errorId, controlProps } = fieldIds({ name, label, helper, error });
  return (
    <FieldShell {...{ name, label, helper, error, helperId, errorId, className }}>
      <select {...controlProps} className={cn('min-h-11', controlClasses(error))} {...select}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export type TextAreaFieldProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'name'>;

export function TextAreaField({
  name,
  label,
  helper,
  error,
  className,
  ...textarea
}: TextAreaFieldProps) {
  const { helperId, errorId, controlProps } = fieldIds({ name, label, helper, error });
  return (
    <FieldShell {...{ name, label, helper, error, helperId, errorId, className }}>
      <textarea
        {...controlProps}
        className={cn('min-h-28 py-3', controlClasses(error))}
        {...textarea}
      />
    </FieldShell>
  );
}

export interface ChoiceCardsProps {
  name: string;
  legend: string;
  options: readonly { value: string; label: string; description?: string }[];
  defaultValue?: string;
  error?: string;
}

/**
 * Escolha única em cartões (onboarding, CF-035): `fieldset` + `legend` + rádios nativos, então
 * teclado (setas) e leitor de tela funcionam sem JavaScript extra. O cartão inteiro é clicável.
 */
export function ChoiceCards({ name, legend, options, defaultValue, error }: ChoiceCardsProps) {
  const errorId = error ? `${name}-erro` : undefined;
  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={errorId}>
      <legend className="mb-1 text-sm font-medium text-cf-text">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-cf-surface p-4',
            'has-checked:border-cf-primary has-checked:bg-cf-surface-muted',
            'has-focus-visible:ring-2 has-focus-visible:ring-cf-primary/40',
            error ? 'border-danger' : 'border-cf-border',
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={option.value === defaultValue}
            aria-invalid={error ? true : undefined}
            className="mt-1 accent-cf-primary"
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-medium text-cf-text">{option.label}</span>
            {option.description ? (
              <span className="text-sm text-cf-text-secondary">{option.description}</span>
            ) : null}
          </span>
        </label>
      ))}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
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

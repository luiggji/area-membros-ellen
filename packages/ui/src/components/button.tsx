import { type ButtonHTMLAttributes, useId } from 'react';

import { cn } from '../lib/cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-cf-primary text-cf-surface hover:bg-cf-primary-hover disabled:bg-cf-surface-muted disabled:text-cf-text-secondary',
  secondary:
    'border border-cf-primary text-cf-primary hover:bg-cf-surface-muted disabled:border-cf-border disabled:text-cf-text-secondary',
  ghost:
    'text-cf-text-secondary hover:bg-cf-surface-muted hover:text-cf-text disabled:text-cf-text-secondary',
  link: 'text-cf-primary hover:text-cf-primary-hover disabled:text-cf-text-secondary',
};

// Alvo de toque mínimo de 44px (WCAG 2.2 / doc G §7) em todos os tamanhos.
const sizes: Record<ButtonSize, string> = {
  md: 'min-h-11 px-6',
  icon: 'size-11 shrink-0 rounded-full',
};

/**
 * Classes do botão para qualquer elemento: `<button>`, `<a>` ou o `Link` do Next, que o pacote
 * não conhece. Uma ação principal por seção (doc G §1).
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed',
    sizes[size],
    variant === 'link' && 'px-0',
    variants[variant],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Motivo visível de o botão estar desabilitado (doc G §5: nunca desabilitar sem explicar). */
  disabledReason?: string;
}

export function Button({
  variant,
  size,
  disabledReason,
  className,
  type = 'button',
  'aria-describedby': describedBy,
  ...props
}: ButtonProps) {
  const reasonId = useId();
  const button = (
    <button
      {...props}
      type={type}
      aria-describedby={disabledReason ? reasonId : describedBy}
      className={buttonClasses({ variant, size, className })}
    />
  );
  if (!disabledReason) return button;

  return (
    <span className="inline-flex flex-col items-start gap-1">
      {button}
      <span id={reasonId} className="text-xs text-cf-text-secondary">
        {disabledReason}
      </span>
    </span>
  );
}

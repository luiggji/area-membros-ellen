import { cn } from '../lib/cn.js';

/**
 * Marca tipográfica provisória. O cadeado da referência não é logo oficial: até a logo
 * definitiva (P-006), usa-se só o nome e um monograma neutro (doc G §6).
 */
export function BrandMark({
  tone = 'on-dark',
  className,
}: {
  /** `on-dark` sobre a sidebar vinho; `on-light` sobre o canvas creme. */
  tone?: 'on-dark' | 'on-light';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex items-center gap-2.5 whitespace-nowrap',
        tone === 'on-dark' ? 'text-cream-50' : 'text-cf-sidebar',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full border font-editorial text-xs font-semibold',
          tone === 'on-dark'
            ? 'border-champagne-500/70 text-champagne-500'
            : 'border-cf-primary/40 text-cf-primary',
        )}
      >
        CF
      </span>
      <span className="font-editorial text-lg leading-none tracking-[0.14em] uppercase">
        Caixa Forte
      </span>
    </span>
  );
}

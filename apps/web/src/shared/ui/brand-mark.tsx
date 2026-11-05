import { cn } from '@caixa-forte/ui';
import Image from 'next/image';

/**
 * Marca oficial de trabalho (Brand System V2, `docs/brand/v2/05_UI_DESIGN_SYSTEM/BRAND_USAGE_RULES.md`):
 * - `lockup`: logotipo horizontal em PNG, só sobre creme/branco, nunca menor que 180px;
 * - `sidebar`: símbolo + nome claro empilhado, para o fundo ameixa (o lockup escuro perderia contraste);
 * - `compact`: símbolo + nome em linha, para topbar mobile e espaços estreitos.
 * Os PNGs são os masters entregues pela agência: não recolorir, distorcer nem separar o símbolo.
 */
export function BrandMark({
  variant = 'lockup',
  className,
  priority = false,
}: {
  variant?: 'lockup' | 'sidebar' | 'compact';
  className?: string;
  priority?: boolean;
}) {
  if (variant === 'lockup') {
    return (
      <Image
        src="/brand/logo-horizontal.png"
        alt="Caixa Forte"
        width={220}
        height={66}
        priority={priority}
        className={cn('h-auto w-45 shrink-0 sm:w-55', className)}
      />
    );
  }

  const isSidebar = variant === 'sidebar';
  return (
    <span
      className={cn(
        'flex items-center whitespace-nowrap',
        isSidebar ? 'gap-3' : 'gap-2',
        className,
      )}
    >
      <Image
        src="/brand/symbol.png"
        alt=""
        width={isSidebar ? 56 : 34}
        height={isSidebar ? 56 : 34}
        priority={priority}
        className={cn('shrink-0', isSidebar ? 'size-14' : 'size-8.5')}
      />
      {isSidebar ? (
        <span className="font-editorial text-xl leading-[1.05] tracking-[0.05em] text-cream-50 uppercase">
          Caixa <br />
          Forte
        </span>
      ) : (
        <span className="text-sm font-bold tracking-wide text-cf-sidebar uppercase">
          Caixa Forte
        </span>
      )}
    </span>
  );
}

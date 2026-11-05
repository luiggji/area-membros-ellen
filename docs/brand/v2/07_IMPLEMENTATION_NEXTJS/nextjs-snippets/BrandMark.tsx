import Image from 'next/image';
import Link from 'next/link';

type BrandMarkProps = { compact?: boolean; className?: string };

/** Copy approved PNG into public/brand/ and adjust the path to actual repo. */
export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  return (
    <Link href="/app" className={className} aria-label="Caixa Forte — início">
      <Image src="/brand/symbol-3d.png" alt="" width={42} height={42} className="h-10 w-10 object-contain" priority />
      {!compact && <span className="ml-2 font-serif text-base tracking-wide text-[#FAF7F3]">CAIXA FORTE</span>}
    </Link>
  );
}

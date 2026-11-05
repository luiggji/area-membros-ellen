import Link from 'next/link';

/**
 * Pessoa logada na topbar (CF-171): inicial (sem foto, doc G §4.5) e nome, levando ao perfil.
 * Sem nome preenchido, mostra só a inicial do e-mail e "Sua conta".
 */
export function MemberAccount({ name, email }: { name: string | null; email: string }) {
  const initial = (name ?? email).trim().charAt(0).toUpperCase() || '?';
  return (
    <Link
      href="/app/perfil"
      className="flex min-h-11 items-center gap-3 rounded-full pe-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cf-primary"
    >
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full bg-blush-200 font-medium text-cf-primary"
      >
        {initial}
      </span>
      <span className="hidden text-sm text-cf-text sm:inline">{name ?? 'Sua conta'}</span>
      <span className="sr-only sm:hidden">Seu perfil</span>
    </Link>
  );
}

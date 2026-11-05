import Link from 'next/link';
import type { ReactNode } from 'react';

/** Moldura das telas de autenticação: título editorial, uma frase e o formulário (CF-030). */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">{title}</h1>
        {description ? <p className="text-cf-text-secondary">{description}</p> : null}
      </div>
      <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
        {children}
      </div>
      {footer ? (
        <div className="flex flex-col gap-2 text-sm text-cf-text-secondary">{footer}</div>
      ) : null}
    </section>
  );
}

/** Link discreto de rodapé (COPY_TONE: secundário como link, não botão). */
export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-cf-primary underline underline-offset-4 hover:no-underline">
      {children}
    </Link>
  );
}

import { buttonClasses } from '@caixa-forte/ui';
import { notFound } from 'next/navigation';

import { findSection } from '@/modules/prototype/domain/fixtures';
import { NavIcon } from '@/modules/navigation/presentation/nav-icon';
import { hrefFor } from '@/modules/prototype/presentation/nav-links';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';
import Link from 'next/link';

/** Destinos da navegação: deixam claro qual Issue entrega a tela, sem simular funcionalidade. */
export default async function PrototypeSectionPage({
  params,
}: {
  params: Promise<{ secao: string }>;
}) {
  const section = findSection((await params).secao);
  if (!section) notFound();

  return (
    <PrototypeShell>
      <section className="flex flex-col items-start gap-6 pt-4">
        <span
          aria-hidden
          className="grid size-16 place-items-center rounded-full bg-blush-200 text-cf-primary"
        >
          <NavIcon name={section.icon} className="size-7" />
        </span>
        <h1 className="font-editorial tracking-tight text-5xl text-cf-sidebar">{section.label}</h1>
        <p className="max-w-[52ch] text-cf-text-secondary">
          Esta tela ainda não faz parte do protótipo. Ela será construída em{' '}
          <strong className="font-medium text-cf-text">{section.deliveredBy}</strong>, seguindo a
          mesma linguagem visual (veja <code>docs/BACKLOG.md</code>).
        </p>
        <Link href={hrefFor('')} className={buttonClasses({ variant: 'secondary' })}>
          Voltar ao início
        </Link>
      </section>
    </PrototypeShell>
  );
}

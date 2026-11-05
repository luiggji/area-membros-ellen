import { buttonClasses, Notice } from '@caixa-forte/ui';
import { Download } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { groupBySubject, materialFacts } from '@/modules/materials/domain/material-view';
import { loadMaterials } from '@/modules/materials/infrastructure/materials-api';

export const metadata: Metadata = { title: 'Cofre de Materiais · Caixa Forte' };

type Props = { searchParams: Promise<{ aviso?: string }> };

const NOTICES: Record<string, { tone: 'danger' | 'info'; text: string }> = {
  assinatura: { tone: 'info', text: 'O download dos materiais é para assinantes.' },
  removido: { tone: 'danger', text: 'Este material não está mais no Cofre.' },
  erro: { tone: 'danger', text: 'Não foi possível preparar o download agora. Tente de novo.' },
};

/**
 * Cofre de Materiais (CF-085): o que está publicado, por assunto. Baixar exige acesso pago: o
 * botão leva a uma rota que pede à API um link de 60 s e redireciona na hora.
 */
export default async function VaultPage({ searchParams }: Props) {
  const notice = NOTICES[(await searchParams).aviso ?? ''];
  const vault = await loadMaterials();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-8 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
          Cofre de Materiais
        </h1>
        <p className="text-cf-text-secondary">Modelos e materiais de apoio para o seu dia a dia.</p>
      </header>

      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      {vault === null ? (
        <Notice tone="danger">Não foi possível carregar o Cofre agora. Recarregue a página.</Notice>
      ) : vault.materials.length === 0 ? (
        <p className="rounded-card border border-dashed border-cf-border px-5 py-8 text-center text-sm text-cf-text-secondary">
          Ainda não há materiais publicados. Eles aparecem aqui assim que forem publicados.
        </p>
      ) : (
        <>
          {!vault.canDownload && (
            <Notice>
              Você pode ver o que existe no Cofre; o download fica liberado com a assinatura.{' '}
              <Link href="/app/assinatura" className="underline underline-offset-4">
                Ver minha assinatura
              </Link>
            </Notice>
          )}
          {groupBySubject(vault.materials).map(({ subject, items }) => (
            <section
              key={subject}
              aria-labelledby={`assunto-${subject}`}
              className="flex flex-col gap-3"
            >
              <h2
                id={`assunto-${subject}`}
                className="font-editorial text-2xl tracking-tight text-cf-text"
              >
                {subject}
              </h2>
              <ul className="flex flex-col divide-y divide-cf-border rounded-card border border-cf-border bg-cf-surface">
                {items.map((material) => (
                  <li
                    key={material.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="font-medium text-cf-text">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-cf-text-secondary">{material.description}</p>
                      )}
                      <p className="text-xs text-cf-text-secondary">{materialFacts(material)}</p>
                      {material.course && (
                        <Link
                          href={`/app/cursos/${material.course.slug}`}
                          className="text-xs text-cf-primary underline underline-offset-4"
                        >
                          Do curso {material.course.title}
                        </Link>
                      )}
                      {material.license && (
                        <p className="text-xs text-cf-text-secondary">
                          Licença: {material.license}
                        </p>
                      )}
                    </div>
                    {vault.canDownload && (
                      // Link comum (sem prefetch): o link assinado só é pedido no clique.
                      <a
                        href={`/app/cofre/${material.id}/baixar`}
                        rel="nofollow"
                        className={buttonClasses({ variant: 'secondary', className: 'shrink-0' })}
                      >
                        <Download aria-hidden className="size-4" />
                        Baixar <span className="sr-only">{material.title}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

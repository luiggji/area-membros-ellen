import { can } from '@caixa-forte/contracts';
import { Button, Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { contentAdminApi } from '@/modules/learning/infrastructure/content-admin-api';
import { formatSize } from '@/modules/materials/domain/material-view';
import { materialsAdminApi } from '@/modules/materials/infrastructure/materials-admin-api';
import {
  deleteMaterialAction,
  setMaterialStatusAction,
} from '@/modules/materials/presentation/material-actions';
import { MaterialUploadForm } from '@/modules/materials/presentation/material-upload-form';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Cofre de materiais · Caixa Forte' };

/**
 * Cofre na mão da owner (CF-085): enviar material (nasce em rascunho), publicar ou despublicar e
 * excluir. Excluir tira o arquivo do bucket; o registro e a auditoria ficam.
 */
export default async function MaterialsAdminPage() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'content.manage')) notFound();
  const [materials, content] = await Promise.all([
    materialsAdminApi.list(),
    contentAdminApi.tree(),
  ]);
  const courses = (content?.courses ?? []).map(({ id, title }) => ({ id, title }));

  return (
    <PublicFrame>
      <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-10 py-12">
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-cf-primary underline underline-offset-4">
            Painel da equipe
          </Link>
          <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
            Cofre de materiais
          </h1>
          <p className="text-cf-text-secondary">
            Os arquivos ficam privados. Membros veem só os publicados, e só assinantes baixam, por
            um link que vale 60 segundos.
          </p>
        </div>

        {materials === null ? (
          <Notice tone="danger">
            Não foi possível carregar os materiais agora. Recarregue a página.
          </Notice>
        ) : materials.length === 0 ? (
          <p className="text-cf-text-secondary">Nenhum material ainda. Envie o primeiro abaixo.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-cf-border rounded-(--radius-card) border border-cf-border bg-cf-surface">
            {materials.map((material) => (
              <li
                key={material.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-medium text-cf-text">{material.title}</p>
                  <p className="text-xs break-all text-cf-text-secondary">
                    {material.subject} · {material.kind} · {formatSize(material.sizeBytes)} · versão{' '}
                    {material.version} · {material.fileName}
                  </p>
                  <p className="text-sm text-cf-text-secondary">
                    {material.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <form action={setMaterialStatusAction}>
                    <input type="hidden" name="materialId" value={material.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={material.status === 'published' ? 'draft' : 'published'}
                    />
                    <Button type="submit" variant="secondary">
                      {material.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </Button>
                  </form>
                  <form action={deleteMaterialAction}>
                    <input type="hidden" name="materialId" value={material.id} />
                    <Button type="submit" variant="ghost">
                      Excluir <span className="sr-only">{material.title}</span>
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby="novo-material" className="flex flex-col gap-4">
          <h2 id="novo-material" className="text-lg font-medium text-cf-text">
            Novo material
          </h2>
          <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
            <MaterialUploadForm courses={courses} />
          </div>
        </section>
      </div>
    </PublicFrame>
  );
}

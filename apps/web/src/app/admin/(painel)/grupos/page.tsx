import { can } from '@caixa-forte/contracts';
import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { groupsApi } from '@/modules/community/infrastructure/groups-api';
import { GroupCard } from '@/modules/community/presentation/group-card';
import { CreateGroupForm } from '@/modules/community/presentation/group-forms';
import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';

export const metadata: Metadata = { title: 'Grupos · Caixa Forte' };

/**
 * Grupos temáticos da comunidade (CF-092): só o owner. Criar não publica — o grupo nasce em
 * rascunho e só aparece para o membro quando é publicado. Tudo vai para a trilha de auditoria.
 */
export default async function GroupsPage() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'content.manage')) notFound();
  const groups = await groupsApi.list();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-10 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/admin" className="text-sm text-cf-primary underline underline-offset-4">
          Painel da equipe
        </Link>
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">Grupos</h1>
        <p className="text-cf-text-secondary">
          Os temas em que os membros conversam. Um grupo novo nasce em rascunho: ele só aparece na
          comunidade depois de publicado, e ocultar devolve ele para fora da lista. Toda alteração
          fica na trilha de auditoria.
        </p>
      </div>

      {groups === null ? (
        <Notice tone="danger">
          Não foi possível carregar os grupos agora. Recarregue a página.
        </Notice>
      ) : groups.length === 0 ? (
        <p className="text-cf-text-secondary">
          Nenhum grupo criado ainda. Crie o primeiro abaixo — ele fica em rascunho até você
          publicar.
        </p>
      ) : (
        groups.map((group) => <GroupCard key={group.id} group={group} />)
      )}

      <section aria-labelledby="novo-grupo" className="flex flex-col gap-4">
        <h2 id="novo-grupo" className="text-lg font-medium text-cf-text">
          Novo grupo
        </h2>
        <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
          <CreateGroupForm />
        </div>
      </section>
    </div>
  );
}

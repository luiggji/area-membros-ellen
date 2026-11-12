import { EmptyState, Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CommunityTabs, parseCommunityTab } from '@/modules/community/presentation/community-tabs';
import { FeedList } from '@/modules/community/presentation/feed-list';
import { MemberGroupCard } from '@/modules/community/presentation/member-group-card';
import { loadFeed, loadGroups } from '@/modules/community/infrastructure/community-api';
import { DemoCommunity } from '@/modules/demo/presentation/demo-routes';
import { findMemberSection } from '@/modules/navigation/domain/member-sections';
import { NavIcon } from '@/modules/navigation/presentation/nav-icon';
import { demoMode } from '@/shared/config/demo';

export const metadata: Metadata = { title: 'Comunidade · Caixa Forte' };

type Props = { searchParams: Promise<{ aba?: string | string[] }> };

/** Módulo ainda desligado no ambiente: o mesmo estado vazio que o menu já mostrava (CF-171). */
function AindaNaoAbriu() {
  const section = findMemberSection('comunidade');
  return (
    <EmptyState
      size="page"
      icon={<NavIcon name="community" className="size-5" />}
      title={section?.title ?? 'A comunidade ainda não abriu'}
      description={section?.description ?? ''}
    />
  );
}

function SemAcesso() {
  return (
    <Notice>
      A comunidade é para quem tem assinatura vigente.{' '}
      <Link href="/app/assinatura" className="underline underline-offset-4">
        Ver minha assinatura
      </Link>
    </Notice>
  );
}

const vazio =
  'rounded-card border border-dashed border-cf-border px-5 py-8 text-center text-sm text-cf-text-secondary';

/**
 * Comunidade (CF-093): grupos publicados para entrar e sair, e o feed dos grupos em que a pessoa
 * entrou. Quem decide o acesso é a API (paywall do CF-046); aqui a tela só reflete a resposta.
 * Publicar e comentar chegam no CF-094 — por isso o feed ainda é só leitura.
 */
export default async function CommunityPage({ searchParams }: Props) {
  const search = await searchParams;
  if (demoMode()) return <DemoCommunity search={search} />;
  const tab = parseCommunityTab(search.aba);
  // Cada aba busca só o que mostra: trocar de aba é uma navegação, não um carregamento duplo.
  const data = tab === 'grupos' ? await loadGroups() : await loadFeed();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
            Comunidade
          </h1>
          <p className="text-cf-text-secondary">
            Conversas entre colegas, por grupos de interesse. Sem mensagens privadas.
          </p>
        </div>
        <CommunityTabs current={tab} />
      </header>

      {data === 'indisponivel' ? (
        <AindaNaoAbriu />
      ) : data === 'sem_acesso' ? (
        <SemAcesso />
      ) : data === null ? (
        <Notice tone="danger">
          Não foi possível carregar a comunidade agora. Recarregue a página.
        </Notice>
      ) : 'groups' in data ? (
        data.groups.length === 0 ? (
          <p className={vazio}>
            Nenhum grupo publicado ainda. Eles aparecem aqui assim que forem criados.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.groups.map((group) => (
              <MemberGroupCard key={group.id} group={group} />
            ))}
          </ul>
        )
      ) : data.posts.length > 0 ? (
        <FeedList posts={data.posts} />
      ) : (
        <p className={vazio}>
          {data.joinedAnyGroup
            ? 'Ainda não há publicações nos seus grupos.'
            : 'Entre em um grupo para acompanhar as conversas por aqui.'}
        </p>
      )}
    </div>
  );
}

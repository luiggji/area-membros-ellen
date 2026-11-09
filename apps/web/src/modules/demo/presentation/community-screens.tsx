import {
  Button,
  buttonClasses,
  Card,
  EmptyState,
  SelectField,
  TextAreaField,
  TextField,
} from '@caixa-forte/ui';
import { BRAZIL_STATES } from '@caixa-forte/contracts';
import { Flag, MessageCircle, ShieldCheck, UserRoundSearch } from 'lucide-react';
import Link from 'next/link';

import {
  type ExampleMember,
  type ExamplePost,
  exampleGroups,
  examplePosts,
  searchMembers,
} from '../domain/community-fixtures';
import { hrefFor } from './nav-links';
import { ExampleTag, Initials, LinkTabs, PageHeader, ScreenPage } from './page-parts';

export type CommunityTab = 'publicacoes' | 'grupos';

export function parseCommunityTab(value: unknown): CommunityTab {
  return value === 'grupos' ? 'grupos' : 'publicacoes';
}

const tabs = [
  { value: 'publicacoes', label: 'Publicações', href: hrefFor('comunidade') },
  { value: 'grupos', label: 'Grupos', href: `${hrefFor('comunidade')}?aba=grupos` },
  { value: 'conexoes', label: 'Conexões', href: hrefFor('conexoes') },
];

function Composer() {
  return (
    <Card className="flex flex-col gap-3">
      <TextAreaField
        name="post"
        label="Compartilhe com a comunidade"
        helper="Sem dados de clientes: nada de nomes, números de processo ou documentos."
        rows={3}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled title="Na demonstração, nada é publicado">
          Publicar
        </Button>
        <Link
          href={hrefFor('ajuda')}
          className="text-sm text-cf-primary underline underline-offset-4"
        >
          Regras da comunidade
        </Link>
      </div>
    </Card>
  );
}

function Post({ post }: { post: ExamplePost }) {
  return (
    <Card as="article" className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Initials name={post.author} />
        <div className="flex min-w-0 flex-col">
          <p className="flex flex-wrap items-center gap-2 font-medium text-cf-text">
            {post.author} <ExampleTag />
          </p>
          <p className="text-sm text-cf-text-secondary">
            {post.group} · {post.when}
          </p>
        </div>
      </header>
      <p className="text-cf-text">{post.body}</p>
      {post.comments.length > 0 && (
        <ul className="flex flex-col gap-3 border-l-2 border-cf-border pl-4">
          {post.comments.map((comment) => (
            <li key={comment.body} className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-cf-text">
                {comment.author}{' '}
                <span className="font-normal text-cf-text-secondary">· {comment.when}</span>
              </p>
              <p className="text-cf-text-secondary">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
      <footer className="flex items-center gap-2 border-t border-cf-border pt-3">
        <Button variant="ghost" disabled title="Na demonstração, nada é publicado">
          <MessageCircle aria-hidden className="size-4" strokeWidth={1.6} /> Comentar
        </Button>
        <Button
          variant="ghost"
          disabled
          title="A denúncia é privada: quem publicou não sabe quem denunciou"
          className="ms-auto text-sm"
        >
          <Flag aria-hidden className="size-4" strokeWidth={1.6} /> Denunciar
        </Button>
      </footer>
    </Card>
  );
}

function Groups() {
  return (
    <ul className="flex flex-col gap-3">
      {exampleGroups.map((group) => (
        <Card as="li" key={group.slug} className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="font-medium text-cf-text">{group.name}</p>
            <p className="flex items-center gap-2 text-sm text-cf-text-secondary">
              {group.members} participantes <ExampleTag />
            </p>
          </div>
          <Button
            variant={group.joined ? 'ghost' : 'secondary'}
            disabled
            title="Na demonstração, a participação não é gravada"
          >
            {group.joined ? 'Você participa' : 'Participar'}
          </Button>
        </Card>
      ))}
    </ul>
  );
}

/** Comunidade (doc G §4.4): uma coluna de leitura, abas, composer e denúncia discreta. Sem DM. */
export function CommunityScreen({ tab }: { tab: CommunityTab }) {
  return (
    <ScreenPage width="reading">
      <PageHeader title="Comunidade" summary="Conversas entre colegas, por grupos de interesse.">
        <LinkTabs label="Seções da comunidade" items={tabs} current={tab} />
      </PageHeader>
      {tab === 'grupos' ? (
        <Groups />
      ) : (
        <>
          <Composer />
          {examplePosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </>
      )}
      <p className="flex items-center gap-2 text-xs text-cf-text-secondary">
        <ShieldCheck aria-hidden className="size-4" strokeWidth={1.6} />
        Não há mensagens privadas na Caixa Forte: as conversas acontecem nos grupos.
      </p>
    </ScreenPage>
  );
}

function MemberCard({ member }: { member: ExampleMember }) {
  return (
    <Card as="li" className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <Initials name={member.name} />
        <div className="flex min-w-0 flex-col">
          <p className="font-medium text-cf-text">{member.name}</p>
          <p className="text-sm text-cf-text-secondary">
            {member.city} / {member.state}
          </p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2">
        {member.areas.map((area) => (
          <li
            key={area}
            className="rounded-full bg-cf-surface-muted px-3 py-1 text-xs text-cf-text"
          >
            {area}
          </li>
        ))}
      </ul>
      <Link
        href={hrefFor(`conexoes/${member.id}`)}
        className={buttonClasses({ variant: 'link', className: 'mt-auto self-start' })}
      >
        Ver perfil
      </Link>
    </Card>
  );
}

/** Conexões (doc G §4.5): busca por cidade/UF/área, cards enxutos, sem contato exposto. */
export function ConnectionsScreen({
  query,
}: {
  query: { cidade?: string; uf?: string; area?: string };
}) {
  const members = searchMembers(query);
  return (
    <ScreenPage>
      <PageHeader
        title="Conexões"
        summary="Colegas que escolheram aparecer no diretório. Contato só por vontade de cada um."
      />
      <form
        action={hrefFor('conexoes')}
        className="grid gap-4 rounded-card border border-cf-border bg-cf-surface p-5 sm:grid-cols-[1fr_8rem_1fr_auto] sm:items-end [&>*]:min-w-0"
      >
        <TextField name="cidade" label="Cidade" defaultValue={query.cidade ?? ''} />
        <SelectField
          name="uf"
          label="UF"
          options={[
            { value: '', label: 'Todas' },
            ...BRAZIL_STATES.map((uf) => ({ value: uf, label: uf })),
          ]}
          defaultValue={query.uf ?? ''}
        />
        <TextField name="area" label="Área de atuação" defaultValue={query.area ?? ''} />
        <Button type="submit">Buscar</Button>
      </form>
      <p className="-mt-4 flex items-center gap-2 text-xs text-cf-text-secondary">
        <ExampleTag /> Pessoas fictícias. Experimente buscar “Curitiba” ou “Família”.
      </p>
      {members.length === 0 ? (
        <EmptyState
          icon={<UserRoundSearch className="size-5" />}
          title="Ninguém encontrado"
          description="Tente outra cidade ou área, ou limpe os filtros."
          action={
            <Link href={hrefFor('conexoes')} className={buttonClasses({ variant: 'secondary' })}>
              Limpar filtros
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ul>
      )}
    </ScreenPage>
  );
}

/** Perfil completo do diretório: só o que a pessoa escolheu mostrar; sem botão de mensagem. */
export function MemberProfileScreen({ member }: { member: ExampleMember }) {
  return (
    <ScreenPage width="reading">
      <PageHeader title={member.name} back={{ href: hrefFor('conexoes'), label: 'Conexões' }} />
      <Card className="flex flex-col gap-5 sm:p-8">
        <div className="flex items-center gap-4">
          <Initials name={member.name} size="lg" />
          <div className="flex flex-col gap-1">
            <p className="text-cf-text-secondary">
              {member.city} / {member.state}
            </p>
            <ExampleTag className="self-start" />
          </div>
        </div>
        <ul className="flex flex-wrap gap-2">
          {member.areas.map((area) => (
            <li
              key={area}
              className="rounded-full bg-cf-surface-muted px-3 py-1 text-sm text-cf-text"
            >
              {area}
            </li>
          ))}
        </ul>
        <p className="text-cf-text">{member.bio}</p>
        <p className="border-t border-cf-border pt-4 text-sm text-cf-text-secondary">
          E-mail e telefone não aparecem no diretório. Para conversar, encontre esta pessoa nos
          grupos da comunidade ou no próximo Café Estratégico.
        </p>
      </Card>
    </ScreenPage>
  );
}

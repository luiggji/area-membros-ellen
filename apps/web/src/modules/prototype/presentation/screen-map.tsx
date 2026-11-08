import { Card } from '@caixa-forte/ui';
import Link from 'next/link';

import { hrefFor, PROTOTYPE_MAP_HREF, TEAM_PROTOTYPE_HREF } from './nav-links';
import { PageHeader, PrototypePage } from './page-parts';

interface Screen {
  label: string;
  href: string;
  note?: string;
  /** Issue que ainda vai compor a tela no protótipo. */
  pending?: string;
}

const groups: readonly { title: string; summary: string; screens: readonly Screen[] }[] = [
  {
    title: 'Área do membro',
    summary: 'O que a pessoa assinante vê depois de entrar.',
    screens: [
      { label: 'Início — membro em jornada', href: hrefFor('') },
      { label: 'Início — primeiro acesso', href: `${hrefFor('')}?estado=novo` },
      { label: 'Cursos', href: hrefFor('cursos'), note: 'filtros disponíveis/programados' },
      { label: 'Página do curso', href: hrefFor('cursos/primeiros-clientes') },
      { label: 'Curso programado', href: hrefFor('cursos/atendimento-e-conversao') },
      { label: 'Aula', href: hrefFor('aulas/pc-1') },
      { label: 'Cofre de Materiais', href: hrefFor('cofre') },
      { label: 'Minha Jornada', href: hrefFor('jornada'), note: '3 etapas' },
      { label: 'Meu Planejamento', href: hrefFor('planejamento') },
      { label: 'Comunidade', href: hrefFor('comunidade'), pending: '#154' },
      { label: 'Conexões', href: hrefFor('conexoes'), pending: '#154' },
      { label: 'Ao Vivo', href: hrefFor('ao-vivo'), pending: '#154' },
      { label: 'Café Estratégico', href: hrefFor('cafe'), pending: '#154' },
      { label: 'Assinatura', href: hrefFor('assinatura'), pending: '#154' },
      { label: 'Ajuda', href: hrefFor('ajuda'), pending: '#154' },
    ],
  },
  {
    title: 'Painel da equipe',
    summary: 'Owner e comercial: números, eventos, check-in, conteúdo e moderação.',
    screens: [{ label: 'Visão geral', href: TEAM_PROTOTYPE_HREF, pending: '#155' }],
  },
  {
    title: 'Páginas públicas (reais)',
    summary: 'Já funcionam de verdade, sem dados de exemplo.',
    screens: [
      { label: 'Entrar', href: '/entrar' },
      { label: 'Criar conta', href: '/cadastro' },
      { label: 'Recuperar senha', href: '/recuperar-senha' },
    ],
  },
];

/** Índice do protótipo: Ellen abre qualquer tela daqui, sem procurar no menu. */
export function ScreenMap() {
  return (
    <PrototypePage>
      <PageHeader
        title="Mapa das telas"
        summary="Todas as telas do protótipo em um lugar. Os dados de exemplo são fictícios."
      />
      {groups.map((group, index) => (
        <section
          key={group.title}
          aria-labelledby={`mapa-${index}`}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <h2 id={`mapa-${index}`} className="font-editorial text-2xl text-cf-text">
              {group.title}
            </h2>
            <p className="text-sm text-cf-text-secondary">{group.summary}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.screens.map((screen) => (
              <li key={screen.href}>
                <Card className="flex h-full flex-col gap-1 p-0">
                  <Link
                    href={screen.href}
                    className="flex h-full min-h-11 flex-col gap-1 rounded-card p-5 hover:bg-cf-surface-muted"
                  >
                    <span className="font-medium text-cf-text">{screen.label}</span>
                    <span className="text-sm text-cf-text-secondary">
                      {screen.pending
                        ? `Em composição (${screen.pending})`
                        : (screen.note ?? 'Pronta para avaliar')}
                    </span>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-xs text-cf-text-secondary">
        Ver o mapa de novo: link “mapa das telas” na faixa do topo ({PROTOTYPE_MAP_HREF}).
      </p>
    </PrototypePage>
  );
}

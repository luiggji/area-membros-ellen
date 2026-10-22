import { Button, buttonClasses, Card, EmptyState, ErrorState, LoadingState } from '@caixa-forte/ui';
import { AlertTriangle, ArrowRight, Inbox, Lock, PanelLeft, PanelTop } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrandMark } from '@/shared/ui/brand-mark';

/**
 * Amostras renderizadas com os componentes reais de `@caixa-forte/ui` (CF-020). Os componentes
 * editoriais da home vêm do CF-022 e os estados de tela padrão do CF-157.
 */

/** Aplicações da marca oficial de trabalho (Brand System V2) nos fundos permitidos. */
export function BrandSample() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card className="flex flex-col items-start gap-4">
        <BrandMark />
        <span className="text-xs text-cf-text-secondary">
          lockup · sobre branco ou creme · mínimo 180px (landing, e-mail, cabeçalho público)
        </span>
      </Card>
      <Card tone="deep" className="flex flex-col items-start gap-4">
        <BrandMark variant="sidebar" />
        <span className="text-xs text-cream-50/80">
          sidebar · símbolo + nome claro sobre ameixa (o lockup escuro perde contraste)
        </span>
      </Card>
      <Card tone="muted" className="flex flex-col items-start gap-4">
        <BrandMark variant="compact" />
        <span className="text-xs text-cf-text-secondary">
          compact · topbar mobile e espaços estreitos
        </span>
      </Card>
      <Card className="flex flex-col items-start gap-4">
        <span className="flex items-end gap-4">
          <Image src="/brand/app-icon-192.png" alt="" width={48} height={48} />
          <Image src="/brand/app-icon-192.png" alt="" width={32} height={32} />
          <Image src="/brand/app-icon-192.png" alt="" width={16} height={16} />
        </span>
        <span className="text-xs text-cf-text-secondary">
          ícone do app e favicon · 48, 32 e 16px (instalação, aba do navegador)
        </span>
      </Card>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="text-xs text-cf-text-secondary">{label}</span>
    </div>
  );
}

export function ButtonsSample() {
  return (
    <Card className="flex flex-wrap items-start gap-8 sm:p-8">
      <Labeled label="primary · uma ação principal por seção">
        <Button>
          Continuar <ArrowRight aria-hidden className="size-4" />
        </Button>
      </Labeled>
      <Labeled label="secondary · contorno">
        <Button variant="secondary">Ver detalhes</Button>
      </Labeled>
      <Labeled label="link · navegação (buttonClasses no Link)">
        <Link href="#botoes" className={buttonClasses({ variant: 'link' })}>
          Ver todos <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Labeled>
      <Labeled label="disabledReason · sempre com motivo visível">
        <Button disabled disabledReason="Vagas esgotadas">
          Quero participar
        </Button>
      </Labeled>
      <Labeled label="Foco por teclado (Tab)">
        <span
          className={buttonClasses({ className: 'outline-2 outline-offset-2 outline-cf-focus' })}
        >
          Foco visível
        </span>
      </Labeled>
    </Card>
  );
}

export function CardsSample() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card as="article" className="flex flex-col gap-2">
        <span className="text-xs text-cf-text-secondary">tone=&quot;surface&quot;</span>
        <h3 className="font-editorial tracking-tight text-xl text-cf-sidebar">Card de leitura</h3>
        <p className="text-sm text-cf-text-secondary">
          Cursos, posts e listas. Borda fina, sem sombra.
        </p>
      </Card>
      <Card as="article" tone="muted" className="flex flex-col gap-2">
        <span className="text-xs text-cf-text-secondary">tone=&quot;muted&quot;</span>
        <h3 className="font-editorial tracking-tight text-xl text-cf-sidebar">Card de destaque</h3>
        <p className="text-sm text-cf-text-secondary">Jornada e cards auxiliares da home.</p>
      </Card>
      <Card as="article" tone="deep" className="flex flex-col gap-2">
        <span className="text-xs text-cream-50/70">tone=&quot;deep&quot; · uso raro</span>
        <h3 className="font-editorial tracking-tight text-xl">Superfície profunda</h3>
        <p className="text-sm text-cream-50/80">
          Só sidebar e pontos de marca — nunca a tela inteira.
        </p>
      </Card>
    </div>
  );
}

/** Estados reais de `@caixa-forte/ui` (CF-157), com os textos do COPY_TONE da marca. */
export function StatesSample() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <span className="text-xs text-cf-text-secondary">Carregando · LoadingState</span>
          <LoadingState />
        </Card>
        <EmptyState
          icon={<Inbox className="size-5" />}
          title="Você ainda não começou uma trilha."
          description="Escolha por onde começar."
          action={
            <Link href="/prototipo" className={buttonClasses({ variant: 'secondary' })}>
              Ver o protótipo
            </Link>
          }
        />
        <ErrorState
          icon={<AlertTriangle className="size-5" />}
          title="Não foi possível carregar as aulas."
          description="Tente novamente."
          reference="exemplo-1234"
        />
        <EmptyState
          icon={<Lock className="size-5" />}
          title="Conteúdo para assinantes"
          description="Sem permissão: diz o motivo e o caminho, sem expor o conteúdo. A tela de planos chega com o CF-042."
        />
      </div>
      <p className="text-sm text-cf-text-secondary">
        Telas reais:{' '}
        <Link href="/rota-que-nao-existe" className="text-cf-primary underline underline-offset-4">
          404
        </Link>
        {' · '}
        <Link href="/design/erro" className="text-cf-primary underline underline-offset-4">
          erro inesperado (simulado)
        </Link>
      </p>
    </div>
  );
}

const layouts = [
  {
    name: 'AppShell · membro',
    text: 'Sidebar vinho com até 6 destinos + Mais, topbar discreta, conteúdo até 1180px.',
    href: '/prototipo',
    icon: PanelLeft,
  },
  {
    name: 'AppShell width="wide" · equipe',
    text: 'Mesmo esqueleto com navegação do painel e até 1440px para tabelas e filtros.',
    href: '/prototipo/equipe',
    icon: PanelLeft,
  },
  {
    name: 'PublicShell · público',
    text: 'Sem sidebar: cabeçalho com a marca, conteúdo e rodapé. Landing, planos e eventos.',
    href: '/',
    icon: PanelTop,
  },
];

export function LayoutsSample() {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {layouts.map((layout) => (
        <Card as="li" key={layout.href} className="flex flex-col items-start gap-3">
          <layout.icon aria-hidden className="size-6 text-cf-primary" strokeWidth={1.4} />
          <h3 className="font-medium text-cf-text">
            <code>{layout.name}</code>
          </h3>
          <p className="text-sm text-cf-text-secondary">{layout.text}</p>
          <Link href={layout.href} className={buttonClasses({ variant: 'link' })}>
            Abrir {layout.href} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Card>
      ))}
    </ul>
  );
}

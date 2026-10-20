import { cn } from '@caixa-forte/ui';
import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { contrastChecks } from '../domain/contrast';
import { colorTokens, resolveHex, type TokenGroup } from '../domain/tokens';

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6 border-t border-cf-border pt-10">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="font-editorial tracking-tight text-3xl text-cf-sidebar">
          {title}
        </h2>
        <p className="max-w-[65ch] text-sm text-cf-text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}

const groupTitles: Record<TokenGroup, string> = {
  paleta: 'Paleta base',
  semantico: 'Semânticos (usar nos componentes)',
  estado: 'Estados',
};

export function ColorSwatches() {
  return (
    <div className="flex flex-col gap-8">
      {(['paleta', 'semantico', 'estado'] as const).map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-cf-text">{groupTitles[group]}</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {colorTokens
              .filter((token) => token.group === group)
              .map((token) => (
                <li
                  key={token.name}
                  className="overflow-hidden rounded-xl border border-cf-border bg-cf-surface"
                >
                  <div
                    className="h-16 border-b border-cf-border"
                    style={{ backgroundColor: `var(--color-${token.name})` }}
                  />
                  <div className="flex flex-col gap-0.5 p-3 text-xs">
                    <code className="font-medium text-cf-text">{token.name}</code>
                    <span className="text-cf-text-secondary">
                      {token.value.startsWith('#')
                        ? token.value.toUpperCase()
                        : `→ ${token.value} (${resolveHex(token.name).toUpperCase()})`}
                    </span>
                    <span className="text-cf-text-secondary">{token.usage}</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Verdict({ pass }: { pass: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        pass ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
      )}
    >
      {pass ? <Check aria-hidden className="size-3" /> : <X aria-hidden className="size-3" />}
      {pass ? 'Passa' : 'Falha'}
    </span>
  );
}

export function ContrastTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-cf-border bg-cf-surface">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">Contraste WCAG 2.2 das combinações de cor usadas</caption>
        <thead className="bg-cf-surface-muted text-xs text-cf-text-secondary">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Amostra
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Onde aparece
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Razão
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Texto normal (4,5:1)
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Texto grande / UI (3:1)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cf-border">
          {contrastChecks().map((check) => (
            <tr key={check.context}>
              <td className="px-4 py-3">
                <span
                  className="inline-flex rounded-md px-3 py-1 font-medium"
                  style={{
                    color: `var(--color-${check.foreground})`,
                    backgroundColor: `var(--color-${check.background})`,
                  }}
                >
                  Aa
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="block text-cf-text">{check.context}</span>
                <code className="text-xs text-cf-text-secondary">
                  {check.foreground} / {check.background}
                </code>
              </td>
              <td className="px-4 py-3 font-medium text-cf-text tabular-nums">
                {check.ratio.toFixed(2).replace('.', ',')}:1
              </td>
              <td className="px-4 py-3">
                <Verdict pass={check.normalText} />
              </td>
              <td className="px-4 py-3">
                <Verdict pass={check.largeTextOrUi} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TypographySample() {
  return (
    <div className="grid gap-8 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-cf-text-secondary">
          Display — Playfair Display (Brand V2, OFL no repo) · hero, curso, campanhas
        </p>
        <p className="font-editorial tracking-tight text-6xl leading-none text-cf-sidebar">
          Caixa Forte
        </p>
        <p className="font-editorial tracking-tight text-3xl text-cf-sidebar">Título de seção</p>
        <p className="font-editorial tracking-tight text-xl text-cf-sidebar">Título de card</p>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-xs text-cf-text-secondary">
          Interface — Inter (Brand V2, OFL no repo) · ações, tabelas, formulários e números
        </p>
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-cf-primary uppercase">
          Rótulo de seção
        </p>
        <p className="text-base text-cf-text">
          Corpo de texto confortável, com 45 a 75 caracteres por linha para leitura sem esforço.
        </p>
        <p className="text-sm text-cf-text-secondary">Texto auxiliar e descrições curtas.</p>
        <p className="text-2xl font-medium text-cf-text tabular-nums">12 de 48 · 1.234,56</p>
      </div>
    </div>
  );
}

const spacingScale = [4, 8, 12, 16, 24, 32, 48];

export function SpacingSample() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ul className="flex min-w-0 flex-col gap-2 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6">
        {spacingScale.map((px) => (
          <li key={px} className="flex items-center gap-4 text-xs text-cf-text-secondary">
            <code className="w-12 shrink-0 tabular-nums">{px}px</code>
            <span className="h-3 max-w-full rounded-sm bg-blush-200" style={{ width: px * 4 }} />
          </li>
        ))}
      </ul>
      <dl className="grid gap-4 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 text-sm sm:grid-cols-2 [&_code]:break-all">
        <div>
          <dt className="text-cf-text-secondary">Raio de card</dt>
          <dd className="font-medium text-cf-text">
            <code>--radius-card</code> 16px
          </dd>
        </div>
        <div>
          <dt className="text-cf-text-secondary">Sidebar</dt>
          <dd className="font-medium text-cf-text">
            <code>--spacing-sidebar</code> 232px
          </dd>
        </div>
        <div>
          <dt className="text-cf-text-secondary">Largura do conteúdo</dt>
          <dd className="font-medium text-cf-text">
            <code>--spacing-content-max</code> 1180px
          </dd>
        </div>
        <div>
          <dt className="text-cf-text-secondary">Largura do painel da equipe</dt>
          <dd className="font-medium text-cf-text">
            <code>--spacing-admin-max</code> 1440px
          </dd>
        </div>
        <div>
          <dt className="text-cf-text-secondary">Movimento</dt>
          <dd className="font-medium text-cf-text">150–220ms · respeita reduced-motion</dd>
        </div>
      </dl>
    </div>
  );
}

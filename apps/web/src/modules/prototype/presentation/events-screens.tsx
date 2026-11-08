import { Button, buttonClasses, Card, cn, EditorialArt, Eyebrow } from '@caixa-forte/ui';
import { CalendarDays, Check, Clock, Coffee, MapPin, PlayCircle } from 'lucide-react';
import Link from 'next/link';

import {
  exampleEvent,
  exampleLiveSessions,
  exampleRecordings,
  exampleTicket,
} from '../domain/community-fixtures';
import { hrefFor } from './nav-links';
import { ExampleTag, PageHeader, PrototypePage } from './page-parts';

/** Ao Vivo (doc G §4.7): próximos encontros com data, hora, fuso e uma ação; depois gravações. */
export function LiveScreen() {
  return (
    <PrototypePage width="reading">
      <PageHeader
        title="Ao Vivo"
        summary="Encontros on-line com Ellen e convidados. Horários de Brasília."
      />
      <section aria-labelledby="proximos" className="flex flex-col gap-4">
        <h2 id="proximos" className="flex items-center gap-2 font-editorial text-xl text-cf-text">
          Próximos encontros <ExampleTag />
        </h2>
        <ul className="flex flex-col gap-3">
          {exampleLiveSessions.map((session) => (
            <Card as="li" key={session.title} className="flex flex-wrap items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-medium text-cf-text">{session.title}</p>
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cf-text-secondary">
                  <span className="flex items-center gap-1">
                    <CalendarDays aria-hidden className="size-4" strokeWidth={1.6} />
                    {session.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden className="size-4" strokeWidth={1.6} />
                    {session.time} (Brasília)
                  </span>
                  <span className="font-medium text-cf-primary">{session.status}</span>
                </p>
              </div>
              <Button
                variant="secondary"
                disabled
                title="O link da sala aparece aqui perto do horário, só para assinantes"
              >
                Lembrar-me
              </Button>
            </Card>
          ))}
        </ul>
      </section>
      <section aria-labelledby="gravacoes" className="flex flex-col gap-4">
        <h2 id="gravacoes" className="font-editorial text-xl text-cf-text">
          Gravações
        </h2>
        <ul className="flex flex-col divide-y divide-cf-border rounded-card border border-cf-border bg-cf-surface">
          {exampleRecordings.map((recording) => (
            <li key={recording.title} className="flex min-h-14 items-center gap-3 px-5 py-3">
              <PlayCircle
                aria-hidden
                className="size-5 shrink-0 text-cf-primary"
                strokeWidth={1.6}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-cf-text">{recording.title}</span>
                <span className="text-sm text-cf-text-secondary">
                  {recording.date} · {recording.minutes} min
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </PrototypePage>
  );
}

/** Café Estratégico (doc G §4.8): mais comercial, mesma paleta; clareza de data, lote e vagas. */
export function CafeScreen() {
  const event = exampleEvent;
  return (
    <PrototypePage>
      <section className="grid items-center gap-6 rounded-lg border border-cf-border bg-cf-surface p-5 sm:p-9 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-3 max-md:order-2">
          <Eyebrow>{event.edition}</Eyebrow>
          <h1 className="flex flex-wrap items-center gap-3 font-editorial text-4xl tracking-tight text-cf-text sm:text-5xl">
            {event.title} <ExampleTag />
          </h1>
          <ul className="flex flex-col gap-2 text-cf-text-secondary">
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden className="size-4 text-cf-primary" strokeWidth={1.6} />
              {event.date} · {event.time}
            </li>
            <li className="flex items-center gap-2">
              <MapPin aria-hidden className="size-4 text-cf-primary" strokeWidth={1.6} />
              {event.venue} · {event.city}
            </li>
          </ul>
          <a href="#ingressos" className={buttonClasses({ className: 'mt-2 self-start' })}>
            Ver ingressos
          </a>
        </div>
        <EditorialArt
          caption="Uma manhã para planejar com calma."
          icon={<Coffee className="size-16 opacity-70" strokeWidth={1.2} />}
          className="h-40 sm:h-56 max-md:order-1"
        />
      </section>

      <section aria-labelledby="o-que-acontece" className="flex flex-col gap-4">
        <h2 id="o-que-acontece" className="font-editorial text-2xl text-cf-text">
          O que acontece no encontro
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {event.benefits.map((benefit) => (
            <Card as="li" key={benefit} tone="muted" className="flex items-start gap-3">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-cf-primary" />
              <span className="text-cf-text">{benefit}</span>
            </Card>
          ))}
        </ul>
      </section>

      <section
        id="ingressos"
        aria-labelledby="ingressos-titulo"
        className="flex scroll-mt-6 flex-col gap-4"
      >
        <h2 id="ingressos-titulo" className="font-editorial text-2xl text-cf-text">
          Ingressos
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {event.lots.map((lot) => {
            const open = lot.state === 'Disponível';
            return (
              <Card
                as="li"
                key={lot.name}
                className={cn('flex flex-col gap-2', open ? 'border-cf-primary' : 'opacity-80')}
              >
                <p className="text-sm text-cf-text-secondary">{lot.name}</p>
                <p className="text-3xl font-medium text-cf-text tabular-nums">{lot.price}</p>
                <p
                  className={cn(
                    'text-sm',
                    open ? 'font-medium text-cf-primary' : 'text-cf-text-secondary',
                  )}
                >
                  {lot.state}
                  {'seats' in lot && ` · ${lot.seats}`}
                </p>
                {open && (
                  <Link
                    href={hrefFor('cafe/ingresso')}
                    className={buttonClasses({ className: 'mt-2' })}
                  >
                    Comprar ingresso
                  </Link>
                )}
              </Card>
            );
          })}
        </ul>
        <p className="text-sm text-cf-text-secondary">
          O ingresso vale para o encontro e não inclui a assinatura da Caixa Forte. Política de
          cancelamento e reembolso na página de compra.
        </p>
      </section>
    </PrototypePage>
  );
}

/** QR desenhado só para o protótipo: padrão fixo, sem token, sem dado pessoal. */
function ExampleQr() {
  const size = 21;
  const cells: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const finder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      if (finder) {
        const fx = x >= size - 7 ? x - (size - 7) : x;
        const fy = y >= size - 7 ? y - (size - 7) : y;
        const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6;
        const core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
        if (ring || core) cells.push([x, y]);
      } else if ((x * 7 + y * 13 + x * y) % 3 === 0) {
        cells.push([x, y]);
      }
    }
  }
  return (
    <svg
      role="img"
      aria-label="QR de exemplo, sem valor de entrada"
      viewBox={`-2 -2 ${size + 4} ${size + 4}`}
      className="size-48 rounded-md bg-cf-surface text-cf-sidebar sm:size-56"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}

/** Ingresso digital após a compra confirmada pelo gateway: QR opaco, nome, data e status. */
export function TicketScreen() {
  return (
    <PrototypePage width="reading">
      <PageHeader
        title="Seu ingresso"
        summary="Apresente este QR na entrada. Ele vale uma vez."
        back={{ href: hrefFor('cafe'), label: 'Café Estratégico' }}
      />
      <Card className="flex flex-col items-center gap-5 text-center sm:p-10">
        <ExampleTag />
        <ExampleQr />
        <div className="flex flex-col gap-1">
          <p className="font-editorial text-2xl text-cf-text">
            {exampleEvent.title} · {exampleEvent.edition}
          </p>
          <p className="text-cf-text-secondary">
            {exampleEvent.date} · {exampleEvent.time}
          </p>
          <p className="text-cf-text-secondary">{exampleEvent.venue}</p>
        </div>
        <dl className="grid w-full max-w-sm grid-cols-2 gap-3 border-t border-cf-border pt-5 text-left text-sm">
          <dt className="text-cf-text-secondary">Participante</dt>
          <dd className="text-cf-text">{exampleTicket.holder}</dd>
          <dt className="text-cf-text-secondary">Status</dt>
          <dd className="font-medium text-cf-primary">{exampleTicket.status}</dd>
        </dl>
      </Card>
      <p className="text-sm text-cf-text-secondary">
        O ingresso só aparece depois que o pagamento é confirmado. Não compartilhe o QR: no
        check-in, ele passa a constar como usado.
      </p>
    </PrototypePage>
  );
}

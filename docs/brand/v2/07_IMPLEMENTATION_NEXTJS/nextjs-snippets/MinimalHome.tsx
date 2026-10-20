import Link from 'next/link';

type Course = { id: string; title: string; summary: string; coverUrl?: string; status: 'available'|'scheduled' };
type MinimalHomeProps = { displayName?: string; courses: Course[]; nextAction: {label:string; href:string}; nextEvent?: {title:string; href:string} };

/** Presentational example; pass server-authorized data from the real route. */
export function MinimalHome({ displayName, courses, nextAction, nextEvent }: MinimalHomeProps) {
  return <main className="min-h-screen bg-cf-bg px-4 py-8 text-cf-ink md:px-8">
    <div className="mx-auto max-w-[1180px] space-y-8">
      <section className="rounded-2xl border border-cf-border bg-cf-surface px-6 py-9">
        <p className="text-xs font-semibold tracking-[.16em] text-cf-primary">BEM-VINDO À COMUNIDADE</p>
        <h1 className="mt-2 font-cf-display text-4xl">Caixa Forte</h1>
        <p className="mt-2 max-w-lg text-cf-muted">Conhecimento. Estratégia. Evolução.</p>
        {displayName && <p className="mt-4 text-sm text-cf-muted">Olá, {displayName}.</p>}
      </section>
      <section aria-labelledby="jornada" className="rounded-2xl border border-cf-border bg-[#F3EAE4] px-6 py-7">
        <p className="text-xs font-semibold tracking-widest text-cf-primary">MINHA JORNADA</p>
        <h2 id="jornada" className="mt-2 font-cf-display text-3xl">Seu próximo passo</h2>
        <Link href={nextAction.href} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-cf-primary px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">{nextAction.label}</Link>
      </section>
      <section aria-labelledby="cursos"><div className="mb-4 flex items-center justify-between"><h2 id="cursos" className="font-cf-display text-3xl">Cursos em destaque</h2><Link href="/app/cursos" className="text-sm text-cf-primary">Ver todos</Link></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.slice(0,3).map(course=><article key={course.id} className="rounded-2xl border border-cf-border bg-cf-surface p-5"><h3 className="font-cf-display text-2xl">{course.title}</h3><p className="mt-2 text-sm text-cf-muted">{course.summary}</p><p className="mt-3 text-xs text-cf-muted">{course.status==='scheduled'?'Em preparação':'Disponível'}</p></article>)}</div>
        {courses.length===0 && <p className="mt-3 text-sm text-cf-muted">Novos conteúdos serão publicados em breve.</p>}
      </section>
      <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-cf-border bg-cf-surface p-6"><h2 className="font-cf-display text-2xl">Café Estratégico</h2>{nextEvent?<Link href={nextEvent.href} className="text-sm text-cf-primary">{nextEvent.title} →</Link>:<p className="text-sm text-cf-muted">Novas edições serão anunciadas aqui.</p>}</div><Link href="/app/comunidade" className="rounded-2xl border border-cf-border bg-cf-surface p-6"><h2 className="font-cf-display text-2xl">Comunidade</h2><p className="mt-2 text-sm text-cf-muted">Aprenda e conecte-se com outros profissionais.</p></Link></section>
    </div>
  </main>
}

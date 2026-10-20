/**
 * Placeholder honesto da fundação (CF-150). A página pública real é CF-042; nada aqui simula
 * conteúdo, preço ou dado real.
 */
export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col justify-center gap-6 py-24">
      <p className="text-xs font-medium tracking-[0.2em] text-cf-text-secondary uppercase">
        Em construção
      </p>
      <h1 className="font-editorial text-5xl font-semibold text-cf-sidebar sm:text-6xl">
        Caixa Forte
      </h1>
      <p className="max-w-prose text-lg text-cf-text-secondary">
        A plataforma está sendo preparada. Em breve, novidades por aqui.
      </p>
    </section>
  );
}

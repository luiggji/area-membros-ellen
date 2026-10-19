/**
 * Placeholder honesto da fundação (CF-150). A página pública real é CF-042 e o shell do membro
 * é CF-020/CF-021; nada aqui simula conteúdo, preço ou dado real.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-(--spacing-content-max) flex-col justify-center gap-6 px-6">
      <p className="text-xs font-medium tracking-[0.2em] text-cf-text-secondary uppercase">
        Em construção
      </p>
      <h1 className="font-editorial text-5xl font-semibold text-cf-sidebar sm:text-6xl">
        Caixa Forte
      </h1>
      <p className="max-w-prose text-lg text-cf-text-secondary">
        A plataforma está sendo preparada. Em breve, novidades por aqui.
      </p>
    </main>
  );
}

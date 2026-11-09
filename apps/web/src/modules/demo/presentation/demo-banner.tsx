/** Faixa fixa do modo demonstração: deixa claro que o conteúdo das telas é exemplo (doc G §7). */
export function DemoBanner() {
  return (
    <div className="bg-blush-200 px-4 py-2 text-center text-xs text-ink sm:text-sm">
      <strong className="font-semibold">Ambiente de demonstração</strong> · cursos, pessoas, datas e
      números são exemplos para validação · não são dados reais
    </div>
  );
}

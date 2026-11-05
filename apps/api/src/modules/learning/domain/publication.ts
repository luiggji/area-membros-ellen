/**
 * Regra de publicação do conteúdo, a mesma de `private.content_visible` no banco (CF-080):
 * publicado ou agendado, com a data já alcançada (ou sem data). O banco continua sendo a porta do
 * conteúdo protegido; aqui a regra decide só o que o catálogo lista.
 */
export interface Publication {
  status: string;
  publishAt: string | null;
}

const at = (iso: string) => new Date(iso).getTime();

export function isReleased(item: Publication, now: Date): boolean {
  if (item.status !== 'published' && item.status !== 'scheduled') return false;
  return item.publishAt === null || at(item.publishAt) <= now.getTime();
}

/** Agendado com data futura: aparece como "programado para", nunca como liberado. */
export function isUpcoming(item: Publication, now: Date): boolean {
  return (
    item.status === 'scheduled' && item.publishAt !== null && at(item.publishAt) > now.getTime()
  );
}

export type CatalogState =
  | { availability: 'available'; availableAt: null }
  | { availability: 'scheduled'; availableAt: string }
  | null;

/**
 * Estado do curso no catálogo junto com a trilha (quando houver): disponível se os dois estão
 * liberados; programado se cada um está liberado ou agendado, com a data mais tardia; qualquer
 * rascunho no caminho esconde o curso.
 */
export function catalogState(
  course: Publication,
  track: Publication | null,
  now: Date,
): CatalogState {
  const path = track ? [course, track] : [course];
  if (path.every((item) => isReleased(item, now))) {
    return { availability: 'available', availableAt: null };
  }
  if (!path.every((item) => isReleased(item, now) || isUpcoming(item, now))) return null;
  const latest = path
    .filter((item) => isUpcoming(item, now))
    .map((item) => item.publishAt as string)
    .reduce((a, b) => (at(a) >= at(b) ? a : b));
  return { availability: 'scheduled', availableAt: latest };
}

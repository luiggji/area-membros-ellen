import {
  type Catalog,
  catalogSchema,
  type CourseDetail,
  courseDetailSchema,
} from '@caixa-forte/contracts';

import { callApi } from '@/shared/lib/api/authenticated-api';

/** Catálogo do membro pela API (CF-082). `null` = não foi possível carregar agora. */
export async function loadCatalog(): Promise<Catalog | null> {
  const response = await callApi('/cursos');
  if (!response.ok) return null;
  const parsed = catalogSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

/** Curso pelo endereço: `not_found` quando não está no catálogo; `null` quando falhou. */
export async function loadCourse(slug: string): Promise<CourseDetail | 'not_found' | null> {
  const response = await callApi(`/cursos/${encodeURIComponent(slug)}`);
  if (response.status === 404) return 'not_found';
  if (!response.ok) return null;
  const parsed = courseDetailSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

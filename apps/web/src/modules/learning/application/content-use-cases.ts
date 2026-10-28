import {
  createCourseRequestSchema,
  createModuleRequestSchema,
  updateCourseRequestSchema,
  updateModuleRequestSchema,
} from '@caixa-forte/contracts';
import type { z } from 'zod';

/** Resposta da API do editor de conteúdo (CF-081). */
export type ContentApiResult =
  { ok: true } | { ok: false; status: number; fields?: Record<string, string> };

export interface ContentAdminApi {
  createCourse(body: z.infer<typeof createCourseRequestSchema>): Promise<ContentApiResult>;
  updateCourse(
    id: string,
    body: z.infer<typeof updateCourseRequestSchema>,
  ): Promise<ContentApiResult>;
  createModule(
    courseId: string,
    body: z.infer<typeof createModuleRequestSchema>,
  ): Promise<ContentApiResult>;
  updateModule(
    id: string,
    body: z.infer<typeof updateModuleRequestSchema>,
  ): Promise<ContentApiResult>;
}

export type ContentFormState =
  | { status: 'idle' }
  | {
      status: 'error';
      message?: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string>;
    }
  | { status: 'success'; message: string };

export const CONTENT_MESSAGES = {
  slugTaken: 'Já existe um curso com este endereço.',
  notFound: 'Este item não existe mais. Recarregue a página.',
  forbidden:
    'Sua sessão não tem permissão para editar conteúdo. Entre de novo com a verificação em duas etapas.',
  failed: 'Não foi possível salvar agora. Tente novamente.',
} as const;

/**
 * Data e hora digitadas no horário de Brasília (`aaaa-mm-ddThh:mm`, do campo datetime-local) →
 * instante em UTC. Brasília é UTC-3 o ano todo (sem horário de verão desde 2019).
 */
export function brasiliaLocalToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const date = new Date(`${local}:00-03:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Instante → valor do campo datetime-local no horário de Brasília. */
export function isoToBrasiliaLocal(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

function fromApi(
  result: ContentApiResult,
  success: string,
  values: Record<string, string>,
): ContentFormState {
  if (result.ok) return { status: 'success', message: success };
  if (result.fields) return { status: 'error', fieldErrors: result.fields, values };
  const message =
    result.status === 409
      ? CONTENT_MESSAGES.slugTaken
      : result.status === 404
        ? CONTENT_MESSAGES.notFound
        : result.status === 401 || result.status === 403
          ? CONTENT_MESSAGES.forbidden
          : CONTENT_MESSAGES.failed;
  return { status: 'error', message, values };
}

/** Estado, ordem e data comuns a curso e módulo; a data só vale para agendado. */
function publication(input: Record<string, unknown>) {
  const values = {
    title: text(input.title),
    orderIndex: text(input.orderIndex),
    status: text(input.status),
    publishAt: text(input.publishAt),
  };
  const publishAt = values.publishAt ? brasiliaLocalToIso(values.publishAt) : null;
  return {
    values,
    body: {
      title: values.title,
      orderIndex: values.orderIndex === '' ? Number.NaN : Number(values.orderIndex),
      status: values.status,
      publishAt: values.status === 'scheduled' ? publishAt : null,
    },
    /** Erros do contrato + data do agendamento (o zod só confere a data quando o resto é válido). */
    errors(issues: { path: PropertyKey[]; message: string }[]) {
      const errors = fieldErrors(issues);
      if (values.status === 'scheduled' && !publishAt) {
        errors.publishAt ??= values.publishAt ? 'Data inválida.' : 'Agendado precisa de data.';
      }
      return errors;
    },
  };
}

export async function submitCreateCourse(input: Record<string, unknown>, api: ContentAdminApi) {
  const values = { title: text(input.title), slug: text(input.slug), summary: text(input.summary) };
  const parsed = createCourseRequestSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: fieldErrors(parsed.error.issues),
      values,
    } as ContentFormState;
  }
  return fromApi(
    await api.createCourse(parsed.data),
    `Curso “${parsed.data.title}” criado em rascunho.`,
    values,
  );
}

export async function submitUpdateCourse(input: Record<string, unknown>, api: ContentAdminApi) {
  const { values, body, errors } = publication(input);
  const summary = text(input.summary);
  const parsed = updateCourseRequestSchema.safeParse({ ...body, summary });
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: errors(parsed.error.issues),
      values: { ...values, summary },
    } as ContentFormState;
  }
  return fromApi(await api.updateCourse(text(input.courseId), parsed.data), 'Curso salvo.', {
    ...values,
    summary,
  });
}

export async function submitCreateModule(input: Record<string, unknown>, api: ContentAdminApi) {
  const values = { title: text(input.title) };
  const parsed = createModuleRequestSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: fieldErrors(parsed.error.issues),
      values,
    } as ContentFormState;
  }
  return fromApi(
    await api.createModule(text(input.courseId), parsed.data),
    `Módulo “${parsed.data.title}” criado em rascunho.`,
    values,
  );
}

export async function submitUpdateModule(input: Record<string, unknown>, api: ContentAdminApi) {
  const { values, body, errors } = publication(input);
  const parsed = updateModuleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: errors(parsed.error.issues),
      values,
    } as ContentFormState;
  }
  return fromApi(
    await api.updateModule(text(input.moduleId), parsed.data),
    'Módulo salvo.',
    values,
  );
}

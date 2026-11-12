import {
  createGroupRequestSchema,
  type GroupStatus,
  updateGroupRequestSchema,
} from '@caixa-forte/contracts';
import type { z } from 'zod';

/** Resposta da API de grupos (CF-092). */
export type GroupApiResult =
  { ok: true } | { ok: false; status: number; fields?: Record<string, string> };

export interface GroupsApi {
  create(body: z.infer<typeof createGroupRequestSchema>): Promise<GroupApiResult>;
  update(id: string, body: z.infer<typeof updateGroupRequestSchema>): Promise<GroupApiResult>;
}

export type GroupFormState =
  | { status: 'idle' }
  | {
      status: 'error';
      message?: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string>;
    }
  | { status: 'success'; message: string };

export const GROUP_MESSAGES = {
  slugTaken: 'Já existe um grupo com este identificador.',
  notFound: 'Este grupo não existe mais. Recarregue a página.',
  forbidden:
    'Sua sessão não tem permissão para alterar grupos. Entre de novo com a verificação em duas etapas.',
  failed: 'Não foi possível salvar agora. Tente novamente.',
} as const;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

function fromApi(
  result: GroupApiResult,
  success: string,
  values: Record<string, string>,
): GroupFormState {
  if (result.ok) return { status: 'success', message: success };
  if (result.fields) return { status: 'error', fieldErrors: result.fields, values };
  const message =
    result.status === 409
      ? GROUP_MESSAGES.slugTaken
      : result.status === 404
        ? GROUP_MESSAGES.notFound
        : result.status === 401 || result.status === 403
          ? GROUP_MESSAGES.forbidden
          : GROUP_MESSAGES.failed;
  return { status: 'error', message, values };
}

/** O que Ellen lê depois de salvar: o efeito para o membro, não o nome do estado. */
export function savedMessage(name: string, status: GroupStatus): string {
  if (status === 'published') return `Grupo “${name}” publicado. Os membros já veem.`;
  if (status === 'hidden') return `Grupo “${name}” ocultado. Saiu da lista dos membros.`;
  return `Grupo “${name}” salvo como rascunho. Ainda não aparece para os membros.`;
}

/** Criar não publica: o grupo nasce em rascunho e Ellen decide quando abrir. */
export async function submitCreateGroup(
  input: Record<string, unknown>,
  api: GroupsApi,
): Promise<GroupFormState> {
  const values = {
    slug: text(input.slug),
    name: text(input.name),
    description: text(input.description),
  };
  const parsed = createGroupRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrors(parsed.error.issues), values };
  }
  return fromApi(await api.create(parsed.data), savedMessage(parsed.data.name, 'draft'), values);
}

/** Edita nome e descrição e, no mesmo lugar, publica ou oculta o grupo. */
export async function submitUpdateGroup(
  input: Record<string, unknown>,
  api: GroupsApi,
): Promise<GroupFormState> {
  const values = {
    name: text(input.name),
    description: text(input.description),
    status: text(input.status),
  };
  const parsed = updateGroupRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrors(parsed.error.issues), values };
  }
  return fromApi(
    await api.update(text(input.groupId), parsed.data),
    savedMessage(parsed.data.name, parsed.data.status),
    values,
  );
}

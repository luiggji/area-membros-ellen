import { grantAccessRequestSchema } from '@caixa-forte/contracts';

/** Resposta da API ao conceder (CF-048): sucesso, erro por campo ou erro geral. */
export type GrantApiResult =
  { ok: true } | { ok: false; status: number; fields?: Record<string, string>; message?: string };

export interface GrantsApi {
  grant(body: { email: string; validUntil: string; reason: string }): Promise<GrantApiResult>;
}

export type GrantFormState =
  | { status: 'idle' }
  | {
      status: 'error';
      message?: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string>;
    }
  | { status: 'success'; message: string };

export const GRANT_MESSAGES = {
  memberNotFound: 'Não há conta com este e-mail. A pessoa precisa se cadastrar antes.',
  forbidden:
    'Sua sessão não tem permissão para conceder acesso. Entre de novo com a verificação em duas etapas.',
  failed: 'Não foi possível conceder agora. Tente novamente.',
} as const;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** Valida com o mesmo contrato da API e traduz a resposta em mensagens para o owner. */
export async function submitGrant(
  input: Record<string, unknown>,
  api: GrantsApi,
): Promise<GrantFormState> {
  const values = {
    email: text(input.email),
    validUntil: text(input.validUntil),
    reason: text(input.reason),
  };
  const parsed = grantAccessRequestSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: 'error', fieldErrors, values };
  }
  const result = await api.grant(parsed.data);
  if (result.ok) {
    return { status: 'success', message: `Acesso concedido a ${parsed.data.email}.` };
  }
  if (result.fields) return { status: 'error', fieldErrors: result.fields, values };
  const message =
    result.status === 404
      ? GRANT_MESSAGES.memberNotFound
      : result.status === 401 || result.status === 403
        ? GRANT_MESSAGES.forbidden
        : GRANT_MESSAGES.failed;
  return { status: 'error', message, values };
}

import {
  brlToCents,
  createPlanRequestSchema,
  formatCents,
  PRICE_INTERVALS,
  publishPriceRequestSchema,
  updatePlanRequestSchema,
} from '@caixa-forte/contracts';
import type { z } from 'zod';

/** Resposta da API do catálogo (CF-041). */
export type CatalogApiResult =
  { ok: true } | { ok: false; status: number; fields?: Record<string, string> };

export interface PlansApi {
  create(body: z.infer<typeof createPlanRequestSchema>): Promise<CatalogApiResult>;
  update(id: string, body: z.infer<typeof updatePlanRequestSchema>): Promise<CatalogApiResult>;
  publishPrice(
    id: string,
    body: z.infer<typeof publishPriceRequestSchema>,
  ): Promise<CatalogApiResult>;
}

export type CatalogFormState =
  | { status: 'idle' }
  | {
      status: 'error';
      message?: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string>;
    }
  | { status: 'success'; message: string };

export const CATALOG_MESSAGES = {
  codeTaken: 'Já existe um plano com este código.',
  notFound: 'Este plano não existe mais. Recarregue a página.',
  forbidden:
    'Sua sessão não tem permissão para alterar planos. Entre de novo com a verificação em duas etapas.',
  failed: 'Não foi possível salvar agora. Tente novamente.',
} as const;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

function fromApi(
  result: CatalogApiResult,
  success: string,
  values: Record<string, string>,
): CatalogFormState {
  if (result.ok) return { status: 'success', message: success };
  if (result.fields) return { status: 'error', fieldErrors: result.fields, values };
  const message =
    result.status === 409
      ? CATALOG_MESSAGES.codeTaken
      : result.status === 404
        ? CATALOG_MESSAGES.notFound
        : result.status === 401 || result.status === 403
          ? CATALOG_MESSAGES.forbidden
          : CATALOG_MESSAGES.failed;
  return { status: 'error', message, values };
}

export async function submitCreatePlan(
  input: Record<string, unknown>,
  api: PlansApi,
): Promise<CatalogFormState> {
  const values = {
    code: text(input.code),
    name: text(input.name),
    description: text(input.description),
  };
  const parsed = createPlanRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrors(parsed.error.issues), values };
  }
  return fromApi(await api.create(parsed.data), `Plano “${parsed.data.name}” criado.`, values);
}

export async function submitUpdatePlan(
  input: Record<string, unknown>,
  api: PlansApi,
): Promise<CatalogFormState> {
  const values = { name: text(input.name), description: text(input.description) };
  const parsed = updatePlanRequestSchema.safeParse({ ...values, active: input.active === 'on' });
  if (!parsed.success) {
    return { status: 'error', fieldErrors: fieldErrors(parsed.error.issues), values };
  }
  return fromApi(await api.update(text(input.planId), parsed.data), 'Plano atualizado.', values);
}

/** Valor digitado em reais ("89,90") → centavos; preço novo vale só para novas vendas. */
export async function submitPublishPrice(
  input: Record<string, unknown>,
  api: PlansApi,
): Promise<CatalogFormState> {
  const values = { interval: text(input.interval), amount: text(input.amount) };
  const cents = brlToCents(values.amount);
  if (cents === null) {
    return {
      status: 'error',
      fieldErrors: { amount: 'Informe o valor em reais, ex.: 89,90.' },
      values,
    };
  }
  const parsed = publishPriceRequestSchema.safeParse({
    interval: values.interval,
    amountCents: cents,
  });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error.issues);
    return {
      status: 'error',
      fieldErrors: { interval: errors.interval, amount: errors.amountCents } as Record<
        string,
        string
      >,
      values,
    };
  }
  const label = PRICE_INTERVALS[parsed.data.interval].toLowerCase();
  return fromApi(
    await api.publishPrice(text(input.planId), parsed.data),
    `Novo preço ${label} de ${formatCents(parsed.data.amountCents)} publicado para novas vendas.`,
    values,
  );
}

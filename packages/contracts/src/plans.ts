import { z } from 'zod';

/** Frequências de cobrança (espelha o check de `price_versions.interval`). */
export const PRICE_INTERVALS = { month: 'Mensal', year: 'Anual' } as const;
export type PriceInterval = keyof typeof PRICE_INTERVALS;

const intervalSchema = z.enum(['month', 'year'], { error: 'Escolha mensal ou anual.' });

/**
 * "89", "89,9", "89,90", "1.234,56" ou "R$ 89,00" → centavos (inteiro). `null` se não for um
 * valor em reais válido. Dinheiro nunca passa por float (PRD §8.1).
 */
export function brlToCents(input: string): number | null {
  const text = input.replace(/R\$/i, '').replace(/\s/g, '');
  const match = /^(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  const reais = Number(match[1]!.replace(/\./g, ''));
  const centavos = Number((match[2] ?? '0').padEnd(2, '0'));
  return reais * 100 + centavos;
}

/** Centavos → "R$ 89,00" (pt-BR). */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nome com pelo menos 2 caracteres.')
  .max(80, 'Nome com até 80 caracteres.');
const descriptionSchema = z.string().trim().max(500, 'Descrição com até 500 caracteres.');

export const createPlanRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífen (ex.: plano-anual).')
    .max(60, 'Código com até 60 caracteres.'),
  name: nameSchema,
  description: descriptionSchema,
});
export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>;

/** O código não muda depois de criado: é a referência estável do plano. */
export const updatePlanRequestSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  active: z.boolean(),
});
export type UpdatePlanRequest = z.infer<typeof updatePlanRequestSchema>;

export const publishPriceRequestSchema = z.object({
  interval: intervalSchema,
  amountCents: z
    .number({ error: 'Informe o valor em reais.' })
    .int('Informe o valor em reais.')
    .min(100, 'O valor mínimo é R$ 1,00.')
    .max(10_000_000, 'Valor acima do limite (R$ 100.000,00).'),
});
export type PublishPriceRequest = z.infer<typeof publishPriceRequestSchema>;

export const adminPriceVersionSchema = z.object({
  id: z.uuid(),
  interval: intervalSchema,
  amountCents: z.number().int(),
  currency: z.string(),
  isSellable: z.boolean(),
  effectiveAt: z.string(),
});

export const adminPlanSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  /** Mais recentes primeiro, incluindo as que saíram de venda (histórico). */
  prices: z.array(adminPriceVersionSchema),
});
export type AdminPlan = z.infer<typeof adminPlanSchema>;

export const adminPlanListSchema = z.object({ plans: z.array(adminPlanSchema) });
export type AdminPlanList = z.infer<typeof adminPlanListSchema>;

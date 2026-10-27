import {
  AdminPlan,
  CreatePlanRequest,
  PriceInterval,
  PublishPriceRequest,
  UpdatePlanRequest,
} from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { CatalogWrite, PlanStore } from '../application/plans';

/** Erros do banco que viram resposta de negócio; o resto falha alto (500). */
function toWrite(data: string | null, error: { code?: string } | null, what: string): CatalogWrite {
  if (error?.code === '23505') return { status: 'duplicate' };
  if (error?.code === 'P0002') return { status: 'not_found' };
  if (error || !data) throw new Error(`${what}: falha (${error?.code ?? 'sem retorno'})`);
  return { status: 'ok', id: data };
}

export class SupabasePlanStore implements PlanStore {
  constructor(private readonly client: SupabaseAdmin) {}

  async list(): Promise<AdminPlan[]> {
    const { data, error } = await this.client
      .from('plans')
      .select(
        'id, code, name, description, active, created_at, price_versions(id, interval, amount_cents, currency, is_sellable, effective_at, created_at)',
      )
      .order('created_at');
    if (error) throw new Error(`plans: falha ao listar (${error.code})`);
    return data.map((plan) => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      active: plan.active,
      prices: [...plan.price_versions]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((price) => ({
          id: price.id,
          interval: price.interval as PriceInterval,
          amountCents: price.amount_cents,
          currency: price.currency,
          isSellable: price.is_sellable,
          effectiveAt: price.effective_at,
        })),
    }));
  }

  async create(input: CreatePlanRequest, actorId: string): Promise<CatalogWrite> {
    const { data, error } = await this.client.rpc('save_plan', {
      p_code: input.code,
      p_name: input.name,
      p_description: input.description,
      p_active: true,
      p_actor: actorId,
    });
    return toWrite(data, error, 'save_plan');
  }

  async update(id: string, input: UpdatePlanRequest, actorId: string): Promise<CatalogWrite> {
    const { data, error } = await this.client.rpc('save_plan', {
      p_id: id,
      p_code: '',
      p_name: input.name,
      p_description: input.description,
      p_active: input.active,
      p_actor: actorId,
    });
    return toWrite(data, error, 'save_plan');
  }

  async publishPrice(
    planId: string,
    input: PublishPriceRequest,
    actorId: string,
  ): Promise<CatalogWrite> {
    const { data, error } = await this.client.rpc('publish_price_version', {
      p_plan_id: planId,
      p_interval: input.interval,
      p_amount_cents: input.amountCents,
      p_actor: actorId,
    });
    return toWrite(data, error, 'publish_price_version');
  }
}

/** Dev sem Supabase: catálogo vazio; escrever falha alto em vez de fingir sucesso. */
export class UnconfiguredPlanStore implements PlanStore {
  async list(): Promise<AdminPlan[]> {
    return [];
  }

  private fail(): never {
    throw new Error('Supabase não configurado: catálogo indisponível');
  }

  async create(): Promise<CatalogWrite> {
    this.fail();
  }

  async update(): Promise<CatalogWrite> {
    this.fail();
  }

  async publishPrice(): Promise<CatalogWrite> {
    this.fail();
  }
}

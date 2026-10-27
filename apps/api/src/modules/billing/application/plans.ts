import {
  AdminPlan,
  CreatePlanRequest,
  PublishPriceRequest,
  UpdatePlanRequest,
} from '@caixa-forte/contracts';

/** Resultado de escrita no catálogo; a trilha de auditoria é gravada junto, no banco (CF-041). */
export type CatalogWrite =
  { status: 'ok'; id: string } | { status: 'not_found' } | { status: 'duplicate' };

/** Catálogo de planos e versões de preço (`save_plan` e `publish_price_version` no banco). */
export interface PlanStore {
  list(): Promise<AdminPlan[]>;
  create(input: CreatePlanRequest, actorId: string): Promise<CatalogWrite>;
  update(id: string, input: UpdatePlanRequest, actorId: string): Promise<CatalogWrite>;
  /** Preço novo para novas vendas; a versão vendável anterior sai de venda na mesma transação. */
  publishPrice(planId: string, input: PublishPriceRequest, actorId: string): Promise<CatalogWrite>;
}

export const PLAN_STORE = Symbol('PLAN_STORE');

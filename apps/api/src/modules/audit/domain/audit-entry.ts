/** Papel de quem agiu, no momento da ação (o papel pode mudar depois; a trilha não). */
export type ActorRole = 'owner' | 'commercial' | 'tech' | 'member' | 'system' | 'anonymous';

export type AuditSnapshot = Record<string, unknown>;

export interface AuditEntryInput {
  actorId: string | null;
  actorRole: ActorRole;
  /** `<recurso>.<verbo>`, ex.: `price_version.created`. */
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: AuditSnapshot | null;
  after?: AuditSnapshot | null;
  correlationId?: string | null;
}

/** Entrada pronta para gravar: formatos validados e snapshots sem PII. */
export interface AuditEntry {
  readonly actorId: string | null;
  readonly actorRole: ActorRole;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly before: AuditSnapshot | null;
  readonly after: AuditSnapshot | null;
  readonly correlationId: string | null;
}

export class InvalidAuditEntryError extends Error {}

const ACTION = /^[a-z][a-z_]*(\.[a-z][a-z_]*)+$/;
const TARGET_TYPE = /^[a-z][a-z_]*$/;

export const REDACTED = '[redigido]';

/**
 * Campos que nunca entram na trilha (LGPD, logs sem PII): o valor vira `[redigido]`, mas a chave
 * fica, para mostrar que o campo mudou.
 */
const SENSITIVE_KEY =
  /e-?mail|cpf|cnpj|rg\b|phone|telefone|celular|whats|password|senha|token|secret|segredo|card|cartao|cvv|iban|address|endereco|cep|birth|nascimento|ip_?address/i;

/** Redige em profundidade (objetos e arrays) sem alterar o original. */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, inner]) => [
        key,
        SENSITIVE_KEY.test(key) ? REDACTED : redact(inner),
      ]),
    );
  }
  return value;
}

export function createAuditEntry(input: AuditEntryInput): AuditEntry {
  if (!ACTION.test(input.action)) {
    throw new InvalidAuditEntryError(`action fora do padrão <recurso>.<verbo>: ${input.action}`);
  }
  if (!TARGET_TYPE.test(input.targetType)) {
    throw new InvalidAuditEntryError(`targetType inválido: ${input.targetType}`);
  }
  return {
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    before: input.before ? (redact(input.before) as AuditSnapshot) : null,
    after: input.after ? (redact(input.after) as AuditSnapshot) : null,
    correlationId: input.correlationId ?? null,
  };
}

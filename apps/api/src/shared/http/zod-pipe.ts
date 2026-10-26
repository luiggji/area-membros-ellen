import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

/**
 * Valida a entrada com o schema de `@caixa-forte/contracts` (mesma regra do web). Erro: 400
 * `invalid_body` com a primeira mensagem de cada campo, sem ecoar o valor enviado.
 * Uso: `@Body(new ZodPipe(grantAccessRequestSchema)) body: GrantAccessRequest`.
 */
export class ZodPipe<T extends z.ZodType> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const parsed = this.schema.safeParse(value);
    if (parsed.success) return parsed.data;
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_';
      fields[key] ??= issue.message;
    }
    throw new BadRequestException({ message: 'invalid_body', fields });
  }
}

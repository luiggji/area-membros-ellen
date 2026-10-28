import { z } from 'zod';

import { BRAZIL_STATES } from './profile.js';

const emptyToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

/** Lista digitada separada por vírgula ou quebra de linha → itens sem espaços nas pontas. */
const listFrom = (value: unknown) =>
  typeof value === 'string'
    ? value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : value;

/**
 * Perfil público do diretório (CF-090). Espelha as constraints do banco, que são a autoridade:
 * só o que a pessoa escolhe mostrar. E-mail, telefone e endereço não existem aqui.
 */
export const directoryProfileInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Informe o nome profissional.')
    .max(80, 'Nome profissional com até 80 caracteres.'),
  city: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .min(2, 'Cidade: mínimo de 2 caracteres.')
      .max(80, 'Cidade muito longa.')
      .nullable(),
  ),
  state: z.preprocess(emptyToNull, z.enum(BRAZIL_STATES, 'Escolha uma UF da lista.').nullable()),
  areas: z.preprocess(
    listFrom,
    z
      .array(
        z
          .string()
          .min(2, 'Cada área com pelo menos 2 caracteres.')
          .max(40, 'Cada área com até 40 caracteres.')
          .refine((area) => !area.includes('|'), 'Use vírgula para separar as áreas.'),
      )
      .max(5, 'No máximo 5 áreas de atuação.'),
  ),
  bio: z.preprocess(
    emptyToNull,
    z.string().trim().max(280, 'Apresentação com até 280 caracteres.').nullable(),
  ),
  links: z.preprocess(
    listFrom,
    z
      .array(
        z
          .string()
          .max(200, 'Link muito longo.')
          .regex(/^https:\/\/\S{3,}$/, 'Use links completos começando com https://.'),
      )
      .max(3, 'No máximo 3 links.'),
  ),
});
export type DirectoryProfileInput = z.infer<typeof directoryProfileInputSchema>;

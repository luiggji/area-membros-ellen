import { z } from 'zod';

/** UFs aceitas (espelha o check de `user_profiles.state`). */
export const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

/** Momento de carreira (PRD CF-01: iniciante/solo/equipe). */
export const PROFESSIONAL_STAGES = {
  iniciante: 'Iniciando na advocacia',
  solo: 'Atuo de forma autônoma',
  equipe: 'Tenho equipe ou escritório',
} as const;

export type ProfessionalStage = keyof typeof PROFESSIONAL_STAGES;

const emptyToNull = (value: unknown) => (value === '' ? null : value);

const optionalText = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(
      z
        .string()
        .min(min, `${label}: mínimo de ${min} caracteres.`)
        .max(max, `${label}: máximo de ${max} caracteres.`)
        .nullable(),
    );

/**
 * Dados que o titular edita no próprio perfil (CF-031). Espelha as constraints do banco, que
 * são a autoridade; aqui só dá feedback por campo antes de gravar.
 */
export const profileInputSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80, 'Nome muito longo.'),
  city: optionalText(2, 80, 'Cidade'),
  // Select vazio vira null antes da validação, para o erro do enum chegar em português.
  state: z.preprocess(emptyToNull, z.enum(BRAZIL_STATES, 'Escolha uma UF da lista.').nullable()),
  professional_stage: z.preprocess(
    emptyToNull,
    z
      .enum(
        Object.keys(PROFESSIONAL_STAGES) as [ProfessionalStage, ...ProfessionalStage[]],
        'Escolha uma opção.',
      )
      .nullable(),
  ),
  bio: optionalText(0, 500, 'Apresentação'),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

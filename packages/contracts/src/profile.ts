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

/**
 * Objetivo principal no onboarding (CF-035): as três frentes da home aprovada (D-003). Guia as
 * recomendações determinísticas do diagnóstico (CF-102); não é promessa de resultado.
 */
export const MAIN_GOALS = {
  aprender: { label: 'Aprender', description: 'Cursos e trilhas para evoluir na advocacia.' },
  conectar: {
    label: 'Conectar com colegas',
    description: 'Comunidade e encontros com outros advogados.',
  },
  planejar: {
    label: 'Planejar minha carreira',
    description: 'Diagnóstico, metas de 90 dias e ações de 30 dias.',
  },
} as const;

export type MainGoal = keyof typeof MAIN_GOALS;

/** Etapas do onboarding, cada uma gravada na hora para permitir retomar (CF-035). */
export const onboardingStageSchema = z.object({
  professional_stage: z.preprocess(
    emptyToNull,
    z.enum(
      Object.keys(PROFESSIONAL_STAGES) as [ProfessionalStage, ...ProfessionalStage[]],
      'Escolha uma opção.',
    ),
  ),
});

export const onboardingLocationSchema = z.object({
  city: z.string().trim().min(2, 'Informe sua cidade.').max(80, 'Cidade: máximo de 80 caracteres.'),
  state: z.preprocess(emptyToNull, z.enum(BRAZIL_STATES, 'Escolha uma UF da lista.')),
});

export const onboardingGoalSchema = z.object({
  main_goal: z.preprocess(
    emptyToNull,
    z.enum(Object.keys(MAIN_GOALS) as [MainGoal, ...MainGoal[]], 'Escolha um objetivo.'),
  ),
});

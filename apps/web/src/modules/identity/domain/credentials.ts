import { z } from 'zod';

/**
 * Regras de credencial (CF-030). A política de senha espelha o Supabase Auth
 * (`supabase/config.toml`: 10+ caracteres, maiúscula, minúscula e dígito); validar aqui dá
 * feedback por campo antes de ir ao servidor, mas quem decide é o Auth.
 */
export const PASSWORD_RULE = '10 ou mais caracteres, com letra maiúscula, minúscula e número.';

const email = z.string().trim().toLowerCase().pipe(z.email('Informe um e-mail válido.'));

const password = z
  .string()
  .min(10, 'A senha precisa de 10 ou mais caracteres.')
  .max(72, 'A senha pode ter no máximo 72 caracteres.')
  .regex(/[a-z]/, 'Inclua uma letra minúscula.')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula.')
  .regex(/\d/, 'Inclua um número.');

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80, 'Nome muito longo.'),
  email,
  password,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const passwordResetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((value) => value.password === value.confirm, {
    path: ['confirm'],
    message: 'As senhas não conferem.',
  });

export type FieldErrors = Partial<Record<string, string>>;

/** Primeira mensagem de cada campo, para mostrar abaixo dele. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    errors[field] ??= issue.message;
  }
  return errors;
}

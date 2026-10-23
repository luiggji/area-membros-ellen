import { describe, expect, it } from 'vitest';

import { fieldErrors, newPasswordSchema, signInSchema, signUpSchema } from './credentials';
import { describeRoles } from './role-labels';
import { safeNext } from './safe-redirect';

// Senhas fictícias montadas em tempo de execução: literal parecido com senha dispara o gitleaks.
const STRONG = 'Aa1'.repeat(4);
const OTHER = 'Bb2'.repeat(4);

describe('credenciais', () => {
  it('normaliza o e-mail e aceita senha dentro da política do Auth', () => {
    const parsed = signUpSchema.parse({
      name: ' Pessoa de Teste ',
      email: ' Membro@Teste.Local ',
      password: STRONG,
    });
    expect(parsed).toEqual({
      name: 'Pessoa de Teste',
      email: 'membro@teste.local',
      password: STRONG,
    });
  });

  it('aponta cada regra da senha por campo', () => {
    const result = signUpSchema.safeParse({ name: 'A', email: 'x', password: 'curta' });
    expect(result.success).toBe(false);
    const errors = result.success ? {} : fieldErrors(result.error);
    expect(errors.name).toBe('Informe seu nome.');
    expect(errors.email).toBe('Informe um e-mail válido.');
    expect(errors.password).toBe('A senha precisa de 10 ou mais caracteres.');
  });

  it('exige maiúscula, minúscula e número', () => {
    for (const password of ['semmaiuscula1', 'SEMMINUSCULA1', 'SemNumeroAqui']) {
      expect(
        signUpSchema.safeParse({ name: 'Ana', email: 'a@teste.local', password }).success,
      ).toBe(false);
    }
  });

  it('login só exige senha preenchida (a política vale no cadastro)', () => {
    expect(signInSchema.safeParse({ email: 'a@teste.local', password: 'x' }).success).toBe(true);
  });

  it('nova senha precisa ser confirmada igual', () => {
    const result = newPasswordSchema.safeParse({
      password: STRONG,
      confirm: OTHER,
    });
    expect(result.success ? {} : fieldErrors(result.error)).toEqual({
      confirm: 'As senhas não conferem.',
    });
  });
});

describe('safeNext', () => {
  it('aceita caminhos internos', () => {
    expect(safeNext('/app/cursos?x=1')).toBe('/app/cursos?x=1');
    expect(safeNext('/redefinir-senha')).toBe('/redefinir-senha');
  });

  it('recusa destinos externos ou ambíguos (open redirect)', () => {
    for (const value of [
      'https://evil.test',
      '//evil.test',
      '/\\evil.test',
      '/app\\@evil.test',
      'javascript:alert(1)',
      'app',
      '/app\n',
      '',
      null,
      undefined,
    ]) {
      expect(safeNext(value), String(value)).toBe('/app');
    }
  });
});

describe('describeRoles', () => {
  it('lista a equipe antes do papel base, sem repetir', () => {
    expect(describeRoles(['member', 'owner'])).toBe('Gestão (owner) · Membro');
    expect(describeRoles(['member'])).toBe('Membro');
    expect(describeRoles([])).toBe('');
  });
});

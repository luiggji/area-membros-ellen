import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Notice, SelectField, TextAreaField, TextField } from './form.js';

const html = (node: ReactNode) => renderToStaticMarkup(node);

describe('TextField', () => {
  it('liga o label ao input pelo name', () => {
    const markup = html(<TextField name="email" label="E-mail" type="email" />);
    expect(markup).toContain('for="email"');
    expect(markup).toContain('id="email"');
    expect(markup).toContain('name="email"');
    expect(markup).not.toContain('aria-invalid');
  });

  it('marca o erro e o lê junto com o campo, antes da ajuda', () => {
    const markup = html(
      <TextField name="senha" label="Senha" helper="10+ caracteres" error="Senha muito curta." />,
    );
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('aria-describedby="senha-erro senha-ajuda"');
    expect(markup).toContain('id="senha-erro"');
    expect(markup).toContain('Senha muito curta.');
  });
});

describe('Notice', () => {
  it('erro é alert e confirmação é status', () => {
    expect(html(<Notice tone="danger">Falhou</Notice>)).toContain('role="alert"');
    expect(html(<Notice>Enviamos o link</Notice>)).toContain('role="status"');
  });
});

describe('SelectField e TextAreaField', () => {
  it('select liga label, opção vazia e erro', () => {
    const markup = html(
      <SelectField
        name="state"
        label="UF"
        placeholder="Selecione"
        options={[{ value: 'SP', label: 'SP' }]}
        error="Escolha uma UF da lista."
      />,
    );
    expect(markup).toContain('for="state"');
    expect(markup).toContain('<option value="">Selecione</option>');
    expect(markup).toContain('aria-describedby="state-erro"');
  });

  it('textarea usa o mesmo padrão de ajuda acessível', () => {
    const markup = html(
      <TextAreaField name="bio" label="Apresentação" helper="Até 500 caracteres" />,
    );
    expect(markup).toContain('<textarea');
    expect(markup).toContain('aria-describedby="bio-ajuda"');
  });
});

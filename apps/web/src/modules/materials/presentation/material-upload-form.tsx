'use client';

import { MATERIALS_BUCKET } from '@caixa-forte/contracts';
import { Button, Notice, SelectField, TextAreaField, TextField } from '@caixa-forte/ui';
import { useRef, useState } from 'react';

import { type UploadDeps, type UploadState, uploadMaterial } from '../application/upload-material';
import { createMaterialAction, prepareMaterialUploadAction } from './material-actions';

const ACCEPT = Object.values(MATERIALS_BUCKET.types)
  .flat()
  .map((extension) => `.${extension}`)
  .join(',');

/** O arquivo vai do navegador direto ao bucket privado, pelo link de uso único (CF-162). */
const deps: UploadDeps = {
  prepare: (file) => prepareMaterialUploadAction(file),
  put: async (uploadUrl, file, mimeType) => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': mimeType, 'x-upsert': 'false' },
        body: file,
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  create: (body) => createMaterialAction(body),
};

/** Envio de material pela owner (CF-085): nasce em rascunho; publicar é na lista. */
export function MaterialUploadForm({ courses }: { courses: { id: string; title: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [pending, setPending] = useState(false);
  const error = (field: string) =>
    state.status === 'error' ? state.fieldErrors?.[field] : undefined;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get('file');
    setPending(true);
    const result = await uploadMaterial(
      deps,
      file instanceof File && file.size > 0 ? file : null,
      Object.fromEntries(form),
    );
    setPending(false);
    setState(result);
    if (result.status === 'success') formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {state.status === 'error' && state.message && <Notice tone="danger">{state.message}</Notice>}
      {state.status === 'success' && <Notice>{state.message}</Notice>}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="material-file" className="text-sm font-medium text-cf-text">
          Arquivo
        </label>
        <input
          id="material-file"
          name="file"
          type="file"
          accept={ACCEPT}
          aria-describedby="material-file-ajuda"
          aria-invalid={error('file') ? true : undefined}
          className="min-h-11 text-sm text-cf-text file:mr-3 file:min-h-11 file:rounded-md file:border file:border-cf-border file:bg-cf-surface file:px-4 file:text-sm file:text-cf-text"
        />
        <p id="material-file-ajuda" className="text-xs text-cf-text-secondary">
          PDF, Word, Excel, PowerPoint, PNG ou JPEG, até 25 MB. Fica privado: só assinantes baixam.
        </p>
        {error('file') && (
          <p role="alert" className="text-sm text-cf-primary">
            {error('file')}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="title" label="Título" required error={error('title')} />
        <TextField
          name="subject"
          label="Assunto"
          helper="Agrupa no Cofre (ex.: Contratos)."
          required
          error={error('subject')}
        />
      </div>
      <TextAreaField
        name="description"
        label="Descrição"
        maxLength={600}
        error={error('description')}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField name="version" label="Versão" defaultValue="1" error={error('version')} />
        <TextField name="revisedOn" type="date" label="Revisado em" error={error('revisedOn')} />
        <SelectField
          name="courseId"
          label="Curso (opcional)"
          options={[
            { value: '', label: 'Nenhum' },
            ...courses.map((c) => ({ value: c.id, label: c.title })),
          ]}
          defaultValue=""
          error={error('courseId')}
        />
      </div>
      <TextField
        name="license"
        label="Licença de uso"
        helper="Opcional. Ex.: uso pessoal do assinante."
        error={error('license')}
      />
      <div>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? 'Enviando…' : 'Enviar material'}
        </Button>
      </div>
    </form>
  );
}

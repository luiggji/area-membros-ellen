'use client';

import { CONTENT_STATUSES, type ContentStatus } from '@caixa-forte/contracts';
import { Button, Notice, SelectField, TextAreaField, TextField } from '@caixa-forte/ui';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { type ContentFormState, isoToBrasiliaLocal } from '../application/content-use-cases';
import {
  createCourseAction,
  createModuleAction,
  updateCourseAction,
  updateModuleAction,
} from './content-actions';

function Submit({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending} aria-busy={status.pending}>
      {status.pending ? pending : idle}
    </Button>
  );
}

function useContentForm(
  action: (state: ContentFormState, form: FormData) => Promise<ContentFormState>,
) {
  const [state, formAction] = useActionState<ContentFormState, FormData>(action, {
    status: 'idle',
  });
  return {
    formAction,
    error: (field: string) => (state.status === 'error' ? state.fieldErrors?.[field] : undefined),
    value: (field: string) => (state.status === 'error' ? state.values?.[field] : undefined),
    notice:
      state.status === 'error' && state.message ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : state.status === 'success' ? (
        <Notice>{state.message}</Notice>
      ) : null,
  };
}

const statusOptions = (Object.keys(CONTENT_STATUSES) as ContentStatus[]).map((value) => ({
  value,
  label: CONTENT_STATUSES[value],
}));

/** Estado, data de agendamento (horário de Brasília) e ordem: comuns a curso e módulo. */
function PublicationFields({
  form,
  current,
}: {
  form: ReturnType<typeof useContentForm>;
  current: { status: ContentStatus; publishAt: string | null; orderIndex: number };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_7rem]">
      <SelectField
        name="status"
        label="Estado"
        options={statusOptions}
        defaultValue={form.value('status') ?? current.status}
        error={form.error('status')}
      />
      <TextField
        name="publishAt"
        type="datetime-local"
        label="Publicar em (Brasília)"
        helper="Só para agendado."
        defaultValue={form.value('publishAt') ?? isoToBrasiliaLocal(current.publishAt)}
        error={form.error('publishAt')}
      />
      <TextField
        name="orderIndex"
        type="number"
        min={0}
        label="Ordem"
        defaultValue={form.value('orderIndex') ?? String(current.orderIndex)}
        error={form.error('orderIndex')}
      />
    </div>
  );
}

export function CreateCourseForm() {
  const form = useContentForm(createCourseAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="title"
          label="Título"
          required
          defaultValue={form.value('title')}
          error={form.error('title')}
        />
        <TextField
          name="slug"
          label="Endereço"
          helper="Vira /app/cursos/endereço. Não muda depois."
          autoComplete="off"
          required
          defaultValue={form.value('slug')}
          error={form.error('slug')}
        />
      </div>
      <TextAreaField
        name="summary"
        label="Resumo"
        maxLength={600}
        defaultValue={form.value('summary')}
        error={form.error('summary')}
      />
      <div>
        <Submit idle="Criar curso" pending="Criando…" />
      </div>
    </form>
  );
}

export function EditCourseForm({
  course,
}: {
  course: {
    id: string;
    title: string;
    summary: string | null;
    status: ContentStatus;
    publishAt: string | null;
    orderIndex: number;
  };
}) {
  const form = useContentForm(updateCourseAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <input type="hidden" name="courseId" value={course.id} />
      <TextField
        name="title"
        label="Título"
        required
        defaultValue={form.value('title') ?? course.title}
        error={form.error('title')}
      />
      <TextAreaField
        name="summary"
        label="Resumo"
        maxLength={600}
        defaultValue={form.value('summary') ?? course.summary ?? ''}
        error={form.error('summary')}
      />
      <PublicationFields form={form} current={course} />
      <div>
        <Submit idle="Salvar curso" pending="Salvando…" />
      </div>
    </form>
  );
}

export function CreateModuleForm({ courseId }: { courseId: string }) {
  const form = useContentForm(createModuleAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-3" noValidate>
      {form.notice}
      <input type="hidden" name="courseId" value={courseId} />
      <TextField
        name="title"
        label="Novo módulo"
        required
        defaultValue={form.value('title')}
        error={form.error('title')}
      />
      <div>
        <Submit idle="Criar módulo" pending="Criando…" />
      </div>
    </form>
  );
}

export function EditModuleForm({
  module,
}: {
  module: {
    id: string;
    title: string;
    status: ContentStatus;
    publishAt: string | null;
    orderIndex: number;
  };
}) {
  const form = useContentForm(updateModuleAction);
  return (
    <form action={form.formAction} className="flex flex-col gap-4" noValidate>
      {form.notice}
      <input type="hidden" name="moduleId" value={module.id} />
      <TextField
        name="title"
        label="Título do módulo"
        required
        defaultValue={form.value('title') ?? module.title}
        error={form.error('title')}
      />
      <PublicationFields form={form} current={module} />
      <div>
        <Submit idle="Salvar módulo" pending="Salvando…" />
      </div>
    </form>
  );
}

'use client';

import { Button, Notice } from '@caixa-forte/ui';
import { CheckCircle2 } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { type CompleteState, setCompletedAction } from './progress-actions';

function Submit({ completed }: { completed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={completed ? 'secondary' : 'primary'}
      disabled={pending}
      aria-busy={pending}
    >
      {completed && <CheckCircle2 aria-hidden className="size-4" />}
      {pending ? 'Salvando…' : completed ? 'Concluída · desmarcar' : 'Marcar como concluída'}
    </Button>
  );
}

/** Conclusão da aula pelo próprio membro (CF-084). */
export function CompleteButton({
  lessonId,
  courseSlug,
  completed,
}: {
  lessonId: string;
  courseSlug: string;
  completed: boolean;
}) {
  const [state, action] = useActionState<CompleteState, FormData>(setCompletedAction, {
    status: 'idle',
  });
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="completed" value={completed ? 'false' : 'true'} />
      {state.status === 'error' && <Notice tone="danger">{state.message}</Notice>}
      <div>
        <Submit completed={completed} />
      </div>
    </form>
  );
}

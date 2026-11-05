import type { LessonVideo as Video } from '@caixa-forte/contracts';
import { EditorialArt } from '@caixa-forte/ui';
import { PlayCircle } from 'lucide-react';

import { publicEnv } from '@/shared/config/env';

import { ResumableVideo } from './resumable-video';

/**
 * Vídeo da aula (CF-083): o `src` é o link assinado e temporário da API, que redireciona ao
 * provedor, e retoma da última posição (CF-084). Sem provedor configurado (P-007), um estado
 * honesto no lugar do player, sem player falso.
 */
export function LessonVideo({
  video,
  title,
  lessonId,
  startAt,
}: {
  video: Video;
  title: string;
  lessonId: string;
  startAt: number;
}) {
  if (video.state === 'pending') {
    return (
      <EditorialArt
        icon={<PlayCircle className="size-8" />}
        caption="O vídeo desta aula está em preparação."
        className="aspect-video w-full rounded-card"
      />
    );
  }
  return (
    <ResumableVideo
      src={`${publicEnv.NEXT_PUBLIC_API_URL}${video.path}`}
      title={title}
      lessonId={lessonId}
      startAt={startAt}
    />
  );
}

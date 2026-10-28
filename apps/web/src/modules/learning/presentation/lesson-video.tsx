import type { LessonVideo as Video } from '@caixa-forte/contracts';
import { EditorialArt } from '@caixa-forte/ui';
import { PlayCircle } from 'lucide-react';

import { publicEnv } from '@/shared/config/env';

/**
 * Vídeo da aula (CF-083): o `src` é o link assinado e temporário da API, que redireciona ao
 * provedor. Sem provedor configurado (P-007), um estado honesto no lugar do player, sem player
 * falso.
 */
export function LessonVideo({ video, title }: { video: Video; title: string }) {
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
    <video
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      aria-label={`Vídeo da aula ${title}`}
      src={`${publicEnv.NEXT_PUBLIC_API_URL}${video.path}`}
      className="aspect-video w-full rounded-card bg-cf-sidebar"
    >
      Seu navegador não reproduz este vídeo.
    </video>
  );
}

'use client';

import { useRef } from 'react';

import { savePositionAction } from './progress-actions';

const EVERY_SECONDS = 15;

/**
 * Vídeo que retoma de onde a pessoa parou e guarda a posição a cada 15 s e ao pausar (CF-084).
 * O `src` é o link assinado e temporário da API (CF-083).
 */
export function ResumableVideo({
  src,
  title,
  lessonId,
  startAt,
}: {
  src: string;
  title: string;
  lessonId: string;
  startAt: number;
}) {
  const lastSaved = useRef(startAt);
  const save = (seconds: number) => {
    lastSaved.current = seconds;
    void savePositionAction(lessonId, seconds);
  };

  return (
    <video
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      aria-label={`Vídeo da aula ${title}`}
      src={src}
      className="aspect-video w-full rounded-card bg-cf-sidebar"
      onLoadedMetadata={(event) => {
        const video = event.currentTarget;
        // Perto do fim, recomeça do início em vez de abrir nos créditos.
        if (startAt > 0 && startAt < video.duration - 5) video.currentTime = startAt;
      }}
      onTimeUpdate={(event) => {
        const seconds = event.currentTarget.currentTime;
        if (Math.abs(seconds - lastSaved.current) >= EVERY_SECONDS) save(seconds);
      }}
      onPause={(event) => save(event.currentTarget.currentTime)}
    >
      Seu navegador não reproduz este vídeo.
    </video>
  );
}

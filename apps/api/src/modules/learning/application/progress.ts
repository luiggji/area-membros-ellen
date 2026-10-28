import { ProgressChange, ProgressRow } from '../domain/progress';

/** Progresso por pessoa (CF-084). Só a API grava; o banco deixa cada pessoa ler só o próprio. */
export interface ProgressStore {
  forLessons(userId: string, lessonIds: string[]): Promise<ProgressRow[]>;
  save(userId: string, lessonId: string, change: ProgressChange, now: Date): Promise<ProgressRow>;
}
export const PROGRESS_STORE = Symbol('PROGRESS_STORE');

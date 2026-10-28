import {
  AdminContent,
  CreateCourseRequest,
  CreateLessonRequest,
  CreateModuleRequest,
  CreateTrackRequest,
  LessonContentRequest,
  UpdateCourseRequest,
  UpdateLessonRequest,
  UpdateModuleRequest,
  UpdateTrackRequest,
} from '@caixa-forte/contracts';

/** Resultado de escrita no conteúdo (CF-081/CF-172). */
export type ContentWrite =
  { status: 'ok'; id: string } | { status: 'not_found' } | { status: 'duplicate' };

/** Estrutura editável pela owner: trilhas, cursos, módulos e aulas em qualquer estado. */
export interface ContentAdminStore {
  tree(): Promise<AdminContent>;
  createTrack(input: CreateTrackRequest): Promise<ContentWrite>;
  updateTrack(id: string, input: UpdateTrackRequest): Promise<ContentWrite>;
  createCourse(input: CreateCourseRequest): Promise<ContentWrite>;
  updateCourse(id: string, input: UpdateCourseRequest): Promise<ContentWrite>;
  createModule(courseId: string, input: CreateModuleRequest): Promise<ContentWrite>;
  updateModule(id: string, input: UpdateModuleRequest): Promise<ContentWrite>;
  createLesson(moduleId: string, input: CreateLessonRequest): Promise<ContentWrite>;
  updateLesson(id: string, input: UpdateLessonRequest): Promise<ContentWrite>;
  saveLessonContent(lessonId: string, input: LessonContentRequest): Promise<ContentWrite>;
}

export const CONTENT_ADMIN_STORE = Symbol('CONTENT_ADMIN_STORE');

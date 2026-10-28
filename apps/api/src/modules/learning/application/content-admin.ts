import {
  AdminContent,
  CreateCourseRequest,
  CreateLessonRequest,
  CreateModuleRequest,
  LessonContentRequest,
  UpdateCourseRequest,
  UpdateLessonRequest,
  UpdateModuleRequest,
} from '@caixa-forte/contracts';

/** Resultado de escrita no conteúdo (CF-081/CF-172). */
export type ContentWrite =
  { status: 'ok'; id: string } | { status: 'not_found' } | { status: 'duplicate' };

/** Estrutura editável pela owner: cursos, módulos e aulas em qualquer estado (inclusive rascunho). */
export interface ContentAdminStore {
  tree(): Promise<AdminContent>;
  createCourse(input: CreateCourseRequest): Promise<ContentWrite>;
  updateCourse(id: string, input: UpdateCourseRequest): Promise<ContentWrite>;
  createModule(courseId: string, input: CreateModuleRequest): Promise<ContentWrite>;
  updateModule(id: string, input: UpdateModuleRequest): Promise<ContentWrite>;
  createLesson(moduleId: string, input: CreateLessonRequest): Promise<ContentWrite>;
  updateLesson(id: string, input: UpdateLessonRequest): Promise<ContentWrite>;
  saveLessonContent(lessonId: string, input: LessonContentRequest): Promise<ContentWrite>;
}

export const CONTENT_ADMIN_STORE = Symbol('CONTENT_ADMIN_STORE');

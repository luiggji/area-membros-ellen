import {
  AdminContent,
  CreateCourseRequest,
  CreateModuleRequest,
  UpdateCourseRequest,
  UpdateModuleRequest,
} from '@caixa-forte/contracts';

/** Resultado de escrita no conteúdo (CF-081). */
export type ContentWrite =
  { status: 'ok'; id: string } | { status: 'not_found' } | { status: 'duplicate' };

/** Estrutura editável pela owner: cursos e módulos em qualquer estado (inclusive rascunho). */
export interface ContentAdminStore {
  tree(): Promise<AdminContent>;
  createCourse(input: CreateCourseRequest): Promise<ContentWrite>;
  updateCourse(id: string, input: UpdateCourseRequest): Promise<ContentWrite>;
  createModule(courseId: string, input: CreateModuleRequest): Promise<ContentWrite>;
  updateModule(id: string, input: UpdateModuleRequest): Promise<ContentWrite>;
}

export const CONTENT_ADMIN_STORE = Symbol('CONTENT_ADMIN_STORE');

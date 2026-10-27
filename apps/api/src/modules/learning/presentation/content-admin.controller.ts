import {
  AdminContent,
  adminContentSchema,
  CreateCourseRequest,
  createCourseRequestSchema,
  CreateModuleRequest,
  createModuleRequestSchema,
  UpdateCourseRequest,
  updateCourseRequestSchema,
  UpdateModuleRequest,
  updateModuleRequestSchema,
} from '@caixa-forte/contracts';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { ZodPipe } from '../../../shared/http/zod-pipe';
import { AuditTrail } from '../../audit/application/audit-trail';
import { Principal } from '../../identity/application/ports';
import { CurrentPrincipal, RequirePermission } from '../../identity/presentation/authorization';
import { CONTENT_ADMIN_STORE, ContentAdminStore, ContentWrite } from '../application/content-admin';

/**
 * Editor de conteúdo da owner (CF-081): cursos e módulos sem deploy, com publicação agendada.
 * Só `content.manage` (owner, com MFA). Cada alteração vai para a trilha de auditoria.
 */
@ApiTags('learning')
@Controller('admin/conteudo')
export class ContentAdminController {
  constructor(
    @Inject(CONTENT_ADMIN_STORE) private readonly store: ContentAdminStore,
    private readonly audit: AuditTrail,
  ) {}

  private async done(
    result: ContentWrite,
    principal: Principal,
    action: string,
    targetType: 'course' | 'course_module',
    after: Record<string, unknown>,
  ): Promise<{ id: string }> {
    if (result.status === 'not_found') throw new NotFoundException(`${targetType}_not_found`);
    if (result.status === 'duplicate') throw new ConflictException('course_slug_taken');
    await this.audit.record({
      actorId: principal.userId,
      actorRole: 'owner',
      action,
      targetType,
      targetId: result.id,
      after,
    });
    return { id: result.id };
  }

  @Get()
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Cursos e módulos em qualquer estado, na ordem' })
  @ApiOkResponse({ schema: contractSchema(adminContentSchema) })
  tree(): Promise<AdminContent> {
    return this.store.tree();
  }

  @Post('cursos')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Criar curso (nasce em rascunho)' })
  async createCourse(
    @Body(new ZodPipe(createCourseRequestSchema)) body: CreateCourseRequest,
    @CurrentPrincipal() principal: Principal,
  ) {
    return this.done(await this.store.createCourse(body), principal, 'course.created', 'course', {
      slug: body.slug,
      title: body.title,
    });
  }

  @Patch('cursos/:id')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Editar, ordenar e publicar/agendar curso' })
  async updateCourse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(updateCourseRequestSchema)) body: UpdateCourseRequest,
    @CurrentPrincipal() principal: Principal,
  ) {
    return this.done(
      await this.store.updateCourse(id, body),
      principal,
      'course.updated',
      'course',
      {
        title: body.title,
        orderIndex: body.orderIndex,
        status: body.status,
        publishAt: body.publishAt,
      },
    );
  }

  @Post('cursos/:id/modulos')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Criar módulo no curso (nasce em rascunho)' })
  async createModule(
    @Param('id', new ParseUUIDPipe()) courseId: string,
    @Body(new ZodPipe(createModuleRequestSchema)) body: CreateModuleRequest,
    @CurrentPrincipal() principal: Principal,
  ) {
    return this.done(
      await this.store.createModule(courseId, body),
      principal,
      'course_module.created',
      'course_module',
      { courseId, title: body.title },
    );
  }

  @Patch('modulos/:id')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Editar, ordenar e publicar/agendar módulo' })
  async updateModule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(updateModuleRequestSchema)) body: UpdateModuleRequest,
    @CurrentPrincipal() principal: Principal,
  ) {
    return this.done(
      await this.store.updateModule(id, body),
      principal,
      'course_module.updated',
      'course_module',
      {
        title: body.title,
        orderIndex: body.orderIndex,
        status: body.status,
        publishAt: body.publishAt,
      },
    );
  }
}

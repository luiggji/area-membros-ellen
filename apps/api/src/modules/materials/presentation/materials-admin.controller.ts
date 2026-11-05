import { randomUUID } from 'node:crypto';

import {
  adminMaterialsSchema,
  CreateMaterialRequest,
  createMaterialRequestSchema,
  PrepareMaterialUploadRequest,
  prepareMaterialUploadRequestSchema,
  PrepareMaterialUploadResponse,
  prepareMaterialUploadResponseSchema,
  UpdateMaterialStatusRequest,
  updateMaterialStatusRequestSchema,
} from '@caixa-forte/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import {
  FILE_STORAGE,
  FileStorage,
  prepareMaterialUpload,
} from '../../files/application/file-storage';
import { Principal } from '../../identity/application/ports';
import { CurrentPrincipal, RequirePermission } from '../../identity/presentation/authorization';
import {
  adminMaterials,
  createMaterial,
  deleteMaterial,
  MATERIAL_STORE,
  MaterialStore,
} from '../application/materials';

/**
 * Cofre na mão da owner (CF-085): enviar (link de uso único direto ao bucket + conferência do
 * arquivo), publicar/despublicar e excluir. Só `content.manage` (owner com MFA); tudo auditado.
 */
@ApiTags('materials')
@Controller('admin/materiais')
export class MaterialsAdminController {
  constructor(
    @Inject(MATERIAL_STORE) private readonly store: MaterialStore,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
    private readonly audit: AuditTrail,
  ) {}

  private record(
    principal: Principal,
    action: string,
    targetId: string,
    after: Record<string, unknown>,
  ) {
    return this.audit.record({
      actorId: principal.userId,
      actorRole: 'owner',
      action,
      targetType: 'material',
      targetId,
      after,
    });
  }

  @Get()
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Materiais em qualquer estado (sem os excluídos)' })
  @ApiOkResponse({ schema: contractSchema(adminMaterialsSchema) })
  async list() {
    return { materials: await adminMaterials(this.store) };
  }

  @Post('envios')
  @HttpCode(200)
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Validar nome/tipo/tamanho e criar o link de envio de uso único' })
  @ApiOkResponse({ schema: contractSchema(prepareMaterialUploadResponseSchema) })
  async prepare(
    @Body(new ZodPipe(prepareMaterialUploadRequestSchema)) body: PrepareMaterialUploadRequest,
  ): Promise<PrepareMaterialUploadResponse> {
    const result = await prepareMaterialUpload(this.storage, body, randomUUID);
    if ('rejected' in result) throw new BadRequestException(`upload_${result.rejected}`);
    return result;
  }

  @Post()
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Conferir o arquivo enviado e criar o material (rascunho)' })
  async create(
    @Body(new ZodPipe(createMaterialRequestSchema)) body: CreateMaterialRequest,
    @CurrentPrincipal() principal: Principal,
  ) {
    const result = await createMaterial({ store: this.store, storage: this.storage }, body);
    if (result === 'course_not_found') throw new NotFoundException('course_not_found');
    if ('rejected' in result) throw new BadRequestException(`upload_${result.rejected}`);
    await this.record(principal, 'material.created', result.id, {
      title: body.title,
      subject: body.subject,
      version: body.version,
    });
    return result;
  }

  @Patch(':id')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Publicar ou despublicar material' })
  async setStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(updateMaterialStatusRequestSchema)) body: UpdateMaterialStatusRequest,
    @CurrentPrincipal() principal: Principal,
  ) {
    if (!(await this.store.setStatus(id, body.status, new Date()))) {
      throw new NotFoundException('material_not_found');
    }
    await this.record(principal, 'material.status_changed', id, { status: body.status });
    return { id };
  }

  @Delete(':id')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Excluir material (registro e auditoria ficam; arquivo sai do bucket)' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentPrincipal() principal: Principal,
  ) {
    const deleted = await deleteMaterial(
      { store: this.store, storage: this.storage },
      id,
      new Date(),
    );
    if (!deleted) throw new NotFoundException('material_not_found');
    await this.record(principal, 'material.deleted', id, {
      title: deleted.title,
      fileRemoved: deleted.fileRemoved,
    });
    return { id };
  }
}

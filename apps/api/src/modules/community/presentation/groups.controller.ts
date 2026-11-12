import {
  AdminGroupList,
  adminGroupListSchema,
  CreateGroupRequest,
  createGroupRequestSchema,
  UpdateGroupRequest,
  updateGroupRequestSchema,
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
import { Principal } from '../../identity/application/ports';
import { CurrentPrincipal, RequirePermission } from '../../identity/presentation/authorization';
import { GROUP_STORE, GroupStore, GroupWrite } from '../application/groups';

function idOrThrow(result: GroupWrite): { id: string } {
  if (result.status === 'not_found') throw new NotFoundException('group_not_found');
  if (result.status === 'duplicate') throw new ConflictException('group_slug_taken');
  return { id: result.id };
}

/**
 * Grupos temáticos (CF-092): só quem tem `content.manage` (owner, com MFA). Sem feature flag —
 * o critério de aceite é Ellen publicar ou ocultar grupo sem código, inclusive antes de a
 * comunidade abrir para os membros (a leitura do membro é que fica atrás da flag `community`).
 */
@ApiTags('community')
@Controller('admin/grupos')
export class GroupsController {
  constructor(@Inject(GROUP_STORE) private readonly store: GroupStore) {}

  @Get()
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Grupos, inclusive rascunhos e ocultos' })
  @ApiOkResponse({ schema: contractSchema(adminGroupListSchema) })
  async list(): Promise<AdminGroupList> {
    return { groups: await this.store.list() };
  }

  @Post()
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Criar grupo em rascunho (auditado)' })
  async create(
    @Body(new ZodPipe(createGroupRequestSchema)) body: CreateGroupRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ id: string }> {
    return idOrThrow(await this.store.create(body, principal.userId));
  }

  @Patch(':id')
  @RequirePermission('content.manage')
  @ApiOperation({ summary: 'Editar nome, descrição ou publicar/ocultar grupo (auditado)' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(updateGroupRequestSchema)) body: UpdateGroupRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<{ id: string }> {
    return idOrThrow(await this.store.update(id, body, principal.userId));
  }
}

import { Feed, feedSchema, MemberGroupList, memberGroupListSchema } from '@caixa-forte/contracts';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequireFeature } from '../../../shared/http/feature-flag.guard';
import { contractSchema } from '../../../shared/http/openapi';
import { Principal } from '../../identity/application/ports';
import { CurrentPrincipal } from '../../identity/presentation/authorization';
import { RequireAccess } from '../../membership/presentation/access';
import { COMMUNITY_STORE, CommunityStore } from '../application/membership';

/**
 * Comunidade na visão do membro (CF-093): grupos publicados, participação e feed.
 * `RequireAccess` em tudo — é o "membros ativos veem, outros não" do critério de aceite,
 * decidido no servidor. Publicar e comentar chegam no CF-094.
 */
@ApiTags('community')
@RequireFeature('community')
@Controller('comunidade')
export class CommunityController {
  constructor(@Inject(COMMUNITY_STORE) private readonly store: CommunityStore) {}

  @Get('grupos')
  @RequireAccess()
  @ApiOperation({ summary: 'Grupos publicados, com participantes e a própria participação' })
  @ApiOkResponse({ schema: contractSchema(memberGroupListSchema) })
  async groups(@CurrentPrincipal() principal: Principal): Promise<MemberGroupList> {
    return { groups: await this.store.listGroups(principal.userId) };
  }

  @Get('feed')
  @RequireAccess()
  @ApiOperation({ summary: 'Publicações dos grupos em que a pessoa entrou' })
  @ApiOkResponse({ schema: contractSchema(feedSchema) })
  feed(@CurrentPrincipal() principal: Principal): Promise<Feed> {
    return this.store.feed(principal.userId);
  }

  @Post('grupos/:id/participar')
  @RequireAccess()
  @HttpCode(204)
  @ApiOperation({ summary: 'Entrar no grupo (idempotente)' })
  async join(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    if ((await this.store.join(id, principal.userId)) === 'not_found') {
      throw new NotFoundException('group_not_found');
    }
  }

  @Delete('grupos/:id/participar')
  @RequireAccess()
  @HttpCode(204)
  @ApiOperation({ summary: 'Sair do grupo (idempotente)' })
  async leave(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<void> {
    if ((await this.store.leave(id, principal.userId)) === 'not_found') {
      throw new NotFoundException('group_not_found');
    }
  }
}

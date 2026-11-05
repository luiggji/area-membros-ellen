import {
  MaterialDownload,
  materialDownloadSchema,
  MemberMaterials,
  memberMaterialsSchema,
} from '@caixa-forte/contracts';
import {
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { FILE_STORAGE, FileStorage } from '../../files/application/file-storage';
import { Principal } from '../../identity/application/ports';
import { Authenticated, CurrentPrincipal } from '../../identity/presentation/authorization';
import { ACCESS_READER, AccessReader } from '../../membership/application/ports';
import { RequireAccess } from '../../membership/presentation/access';
import {
  downloadMaterial,
  MATERIAL_STORE,
  MaterialStore,
  memberMaterials,
} from '../application/materials';

/**
 * Cofre do membro (CF-085). Quem está logado vê o que existe; baixar exige acesso pago vigente e
 * sai como link assinado de 60 s, gerado a cada pedido (nunca guardado na página).
 */
@ApiTags('materials')
@Controller('materiais')
export class MaterialsController {
  constructor(
    @Inject(MATERIAL_STORE) private readonly store: MaterialStore,
    @Inject(ACCESS_READER) private readonly access: AccessReader,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Materiais publicados e se quem vê pode baixar' })
  @ApiOkResponse({ schema: contractSchema(memberMaterialsSchema) })
  list(@CurrentPrincipal() principal: Principal): Promise<MemberMaterials> {
    return memberMaterials({ store: this.store, access: this.access }, principal.userId);
  }

  @Post(':id/download')
  @HttpCode(200)
  @RequireAccess()
  @ApiOperation({ summary: 'Link de download de 60 s (só com acesso pago vigente)' })
  @ApiOkResponse({ schema: contractSchema(materialDownloadSchema) })
  async download(@Param('id', new ParseUUIDPipe()) id: string): Promise<MaterialDownload> {
    const link = await downloadMaterial(
      { store: this.store, storage: this.storage },
      id,
      new Date(),
    );
    if (!link) throw new NotFoundException('material_not_found');
    return link;
  }
}

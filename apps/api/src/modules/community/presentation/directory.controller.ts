import {
  DirectoryPage,
  directoryPageSchema,
  DirectorySearchQuery,
  directorySearchQuerySchema,
} from '@caixa-forte/contracts';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { RequireFeature } from '../../../shared/http/feature-flag.guard';
import { contractSchema } from '../../../shared/http/openapi';
import { RATE_LIMIT_WINDOW_MS } from '../../../shared/http/rate-limit.module';
import { ZodPipe } from '../../../shared/http/zod-pipe';
import { RequireAccess } from '../../membership/presentation/access';
import {
  DIRECTORY_SEARCH,
  DirectorySearch,
  searchDirectory,
} from '../application/directory-search';

/** Buscas por minuto por IP: navegar e refinar cabe; varrer o diretório página a página, não. */
export const DIRECTORY_SEARCHES_PER_MINUTE = 20;

/**
 * Diretório de membros (CF-091): só assinante com acesso vigente busca, e só aparece quem aceitou
 * o termo do diretório. Paginado, sem total e com rate limit próprio, contra raspagem (PRD §9).
 */
@ApiTags('community')
@RequireFeature('community')
@Controller('diretorio')
export class DirectoryController {
  constructor(@Inject(DIRECTORY_SEARCH) private readonly directory: DirectorySearch) {}

  @Get()
  @RequireAccess()
  @Throttle({ default: { limit: DIRECTORY_SEARCHES_PER_MINUTE, ttl: RATE_LIMIT_WINDOW_MS } })
  @ApiOperation({ summary: 'Busca por UF, cidade, área e nome (?uf=&cidade=&area=&nome=&pagina=)' })
  @ApiOkResponse({ schema: contractSchema(directoryPageSchema) })
  search(
    @Query(new ZodPipe(directorySearchQuerySchema)) query: DirectorySearchQuery,
  ): Promise<DirectoryPage> {
    return searchDirectory(this.directory, query);
  }
}

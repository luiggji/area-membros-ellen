import { Catalog, catalogSchema, CourseDetail, courseDetailSchema } from '@caixa-forte/contracts';
import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { Principal } from '../../identity/application/ports';
import { Authenticated, CurrentPrincipal } from '../../identity/presentation/authorization';
import { CATALOG_READER, CatalogReader, findCourse, listCatalog } from '../application/catalog';
import { PROGRESS_STORE, ProgressStore } from '../application/progress';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Catálogo do membro (CF-082): qualquer pessoa logada vê o que está disponível e o que está
 * programado (com a data). O conteúdo das aulas fica atrás do paywall no player (CF-083).
 */
@ApiTags('learning')
@Controller('cursos')
export class CatalogController {
  constructor(
    @Inject(CATALOG_READER) private readonly reader: CatalogReader,
    @Inject(PROGRESS_STORE) private readonly progress: ProgressStore,
  ) {}

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Cursos disponíveis e programados, na ordem' })
  @ApiOkResponse({ schema: contractSchema(catalogSchema) })
  list(): Promise<Catalog> {
    return listCatalog(this.reader, new Date());
  }

  @Get(':slug')
  @Authenticated()
  @ApiOperation({ summary: 'Curso com aulas liberadas e o progresso de quem vê (sem conteúdo)' })
  @ApiOkResponse({ schema: contractSchema(courseDetailSchema) })
  async course(
    @Param('slug') slug: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<CourseDetail> {
    const deps = { reader: this.reader, progress: this.progress };
    const course = SLUG.test(slug)
      ? await findCourse(deps, slug, principal.userId, new Date())
      : null;
    if (!course) throw new NotFoundException('course_not_found');
    return course;
  }
}

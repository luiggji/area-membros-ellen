import { Catalog, catalogSchema, CourseDetail, courseDetailSchema } from '@caixa-forte/contracts';
import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { Authenticated } from '../../identity/presentation/authorization';
import { CATALOG_READER, CatalogReader, findCourse, listCatalog } from '../application/catalog';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Catálogo do membro (CF-082): qualquer pessoa logada vê o que está disponível e o que está
 * programado (com a data). O conteúdo das aulas fica atrás do paywall no player (CF-083).
 */
@ApiTags('learning')
@Controller('cursos')
export class CatalogController {
  constructor(@Inject(CATALOG_READER) private readonly reader: CatalogReader) {}

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Cursos disponíveis e programados, na ordem' })
  @ApiOkResponse({ schema: contractSchema(catalogSchema) })
  list(): Promise<Catalog> {
    return listCatalog(this.reader, new Date());
  }

  @Get(':slug')
  @Authenticated()
  @ApiOperation({ summary: 'Curso com módulos e aulas liberados (sem o conteúdo das aulas)' })
  @ApiOkResponse({ schema: contractSchema(courseDetailSchema) })
  async course(@Param('slug') slug: string): Promise<CourseDetail> {
    const course = SLUG.test(slug) ? await findCourse(this.reader, slug, new Date()) : null;
    if (!course) throw new NotFoundException('course_not_found');
    return course;
  }
}

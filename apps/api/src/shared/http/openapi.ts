import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SchemaObject, SwaggerModule } from '@nestjs/swagger';
import { z } from 'zod';

/** Rotas da documentação, sob o prefixo global: /api/v1/docs e /api/v1/openapi.json (CF-151). */
export const DOCS_PATH = 'docs';
export const OPENAPI_JSON_PATH = 'openapi.json';

/**
 * Schema OpenAPI 3.0 gerado do contrato zod de `@caixa-forte/contracts`: a documentação nunca
 * diverge da validação, porque os dois saem do mesmo schema.
 */
export function contractSchema(schema: z.ZodType): SchemaObject {
  return z.toJSONSchema(schema, { target: 'openapi-3.0' }) as SchemaObject;
}

/** Documento gerado dos controllers registrados (rotas, métodos e respostas anotadas). */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Caixa Forte API')
    .setDescription(
      'API da área de membros Caixa Forte. Contratos em @caixa-forte/contracts (zod); ' +
        'autorização sempre no servidor.',
    )
    .setVersion(process.env.npm_package_version ?? '0.0.0')
    // Access token do Supabase Auth (Authorization: Bearer), verificado no servidor (CF-032).
    .addBearerAuth()
    .build();
  return SwaggerModule.createDocument(app, config);
}

/** Swagger UI + JSON. Desligado em produção por padrão (API_DOCS_ENABLED). */
export function setupOpenApi(app: INestApplication): void {
  SwaggerModule.setup(DOCS_PATH, app, () => buildOpenApiDocument(app), {
    useGlobalPrefix: true,
    jsonDocumentUrl: OPENAPI_JSON_PATH,
    raw: ['json'],
    customSiteTitle: 'Caixa Forte API',
  });
}

import {
  LessonProgress,
  lessonProgressSchema,
  LessonView,
  lessonViewSchema,
  SaveProgressRequest,
  saveProgressRequestSchema,
} from '@caixa-forte/contracts';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  GoneException,
  Header,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Redirect,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { ZodPipe } from '../../../shared/http/zod-pipe';
import { Principal } from '../../identity/application/ports';
import { Authenticated, CurrentPrincipal } from '../../identity/presentation/authorization';
import { ACCESS_READER, AccessReader } from '../../membership/application/ports';
import {
  LESSON_READER,
  LessonReader,
  MEDIA_TOKENS,
  MediaTokens,
  saveProgress,
  VIDEO_PROVIDER,
  VideoProvider,
  viewLesson,
} from '../application/player';
import { PROGRESS_STORE, ProgressStore } from '../application/progress';

/**
 * Player (CF-083). A aula sai inteira só para quem tem acesso pago vigente ou quando é aberta; o
 * vídeo vai por um link assinado e temporário (`/midia/<token>`), nunca por URL pública.
 */
@ApiTags('learning')
@Controller()
export class PlayerController {
  constructor(
    @Inject(LESSON_READER) private readonly lessons: LessonReader,
    @Inject(ACCESS_READER) private readonly access: AccessReader,
    @Inject(VIDEO_PROVIDER) private readonly video: VideoProvider,
    @Inject(MEDIA_TOKENS) private readonly tokens: MediaTokens,
    @Inject(PROGRESS_STORE) private readonly progress: ProgressStore,
  ) {}

  @Get('aulas/:id')
  @Authenticated()
  @ApiOperation({ summary: 'Aula no player: conteúdo e vídeo só com acesso ou aula aberta' })
  @ApiOkResponse({ schema: contractSchema(lessonViewSchema) })
  async lesson(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentPrincipal() principal: Principal,
  ): Promise<LessonView> {
    const deps = {
      lessons: this.lessons,
      access: this.access,
      video: this.video,
      tokens: this.tokens,
      progress: this.progress,
    };
    const view = await viewLesson(deps, id, principal.userId, new Date());
    if (!view) throw new NotFoundException('lesson_not_found');
    return view;
  }

  /** Progresso de quem está logado (CF-084): só em aula liberada que a pessoa pode estudar. */
  @Put('aulas/:id/progresso')
  @Authenticated()
  @ApiOperation({ summary: 'Gravar posição do vídeo e conclusão da aula (no próprio nome)' })
  @ApiOkResponse({ schema: contractSchema(lessonProgressSchema) })
  async saveProgress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodPipe(saveProgressRequestSchema)) body: SaveProgressRequest,
    @CurrentPrincipal() principal: Principal,
  ): Promise<LessonProgress> {
    const deps = { lessons: this.lessons, access: this.access, progress: this.progress };
    const result = await saveProgress(deps, id, principal.userId, body, new Date());
    if (result === 'not_found') throw new NotFoundException('lesson_not_found');
    if (result === 'forbidden') throw new ForbiddenException('subscription_required');
    return result;
  }

  /**
   * Público de propósito: o elemento `<video>` não envia o cabeçalho de sessão. Quem protege é o
   * token (assinado, com validade, emitido só para quem tem acesso). Redireciona para a URL
   * temporária do provedor; nada fica em cache.
   */
  @Get('midia/:token')
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  @Redirect()
  @ApiOperation({ summary: 'Troca o token de mídia pela URL temporária do provedor (302)' })
  async media(@Param('token') token: string): Promise<{ url: string; statusCode: number }> {
    const claims = this.tokens.verify(token, new Date());
    if (claims === 'invalid') throw new UnauthorizedException('media_token_invalid');
    if (claims === 'expired') throw new GoneException('media_token_expired');
    if (!this.video.configured) throw new ServiceUnavailableException('video_provider_pending');
    return { url: await this.video.playbackUrl(claims.mediaRef), statusCode: 302 };
  }
}

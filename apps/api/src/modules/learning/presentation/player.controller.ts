import { LessonView, lessonViewSchema } from '@caixa-forte/contracts';
import {
  Controller,
  Get,
  GoneException,
  Header,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Redirect,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { contractSchema } from '../../../shared/http/openapi';
import { Principal } from '../../identity/application/ports';
import { Authenticated, CurrentPrincipal } from '../../identity/presentation/authorization';
import { ACCESS_READER, AccessReader } from '../../membership/application/ports';
import {
  LESSON_READER,
  LessonReader,
  MEDIA_TOKENS,
  MediaTokens,
  VIDEO_PROVIDER,
  VideoProvider,
  viewLesson,
} from '../application/player';

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
    };
    const view = await viewLesson(deps, id, principal.userId, new Date());
    if (!view) throw new NotFoundException('lesson_not_found');
    return view;
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

# Screen inventory — arquitetura de informação do MVP

As telas listadas são contratos de UX a implementar no repositório existente. Não são rotas já construídas.

## 01_Home — `/app`
Primeiro acesso, jornada principal, três cursos, próximo encontro e comunidade. Hero curto e único CTA. Estados: novo, em progresso, assinatura irregular, nenhum evento.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 02_Catalogo — `/app/cursos`
Busca, filtros discretos, grid 3/2/1 por breakpoint, estados disponível/programado. Sem número fictício de aulas.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 03_Player — `/app/aulas/[id]`
Vídeo dominante, lista de módulos recolhível, arquivos, concluir e próxima aula. Proteção de vídeo e legendas.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 04_Comunidade — `/app/comunidade`
Feed em uma coluna confortável, grupos, comentários, moderação e denúncia. Não incluir mensagens privadas no MVP.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 05_Conexoes — `/app/conexoes`
Diretório opt-in: cidade, UF, área; perfil com privacidade de contato. Sem DM.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 06_Jornada — `/app/jornada`
Diagnóstico com etapas curtas, ação principal clara, salvar e retomar.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 07_Planejamento — `/app/planejamento`
Meta 90 dias + ações 30 dias, sem score fictício.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 08_AoVivo — `/app/ao-vivo`
Eventos reais, datas e horários, gravações disponíveis, estado vazio.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 09_EventoPublico — `/eventos/[slug]`
Oferta do Café, local, data, lote, vagas reais, checkout sem contato obrigatório.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 10_CheckoutIngresso — `/checkout/ingresso`
Preço real e total, confirmação por gateway, estado pending/paid/expired, sem liberar ingresso pela página cliente.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 11_Ingresso — `/ingresso/[id]`
QR token seguro e único, nome, data e status confirmado; antirreplay no check-in.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 12_Admin — `/admin`
Membros, planos editáveis para novas vendas, cursos, eventos, moderação; sem acesso fora da permissão.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 13_Checkin — `/admin/eventos/[id]/checkin`
Tela enxuta, campo QR/nome, confirmado/já utilizado/inválido; logs de auditoria.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

## 14_Assinatura — `/app/assinatura`
Plano atual, status, histórico, cancelamento, política anual e faturamento conforme gateway.
**Estados gerais:** carregando, vazio, erro, sucesso, sem permissão. **Responsivo:** desktop/tablet/mobile. **QA:** keyboard, foco, contraste e integrações reais.

# Arquivos privados no Storage (CF-162)

Materiais pagos ficam no bucket **`materiais`**, sempre **privado**. Nenhum arquivo tem URL pública:
o download é um link assinado de **60 s**, emitido pela API só para quem pode baixar.

## Especificação (fonte única)

`MATERIALS_BUCKET` em `packages/contracts/src/storage.ts`: limite de **25 MiB** e tipos aceitos
(PDF, DOCX, XLSX, PPTX, PNG, JPEG). A API valida tipo, extensão e a assinatura real do arquivo
(magic bytes) antes de gravar; o bucket repete o limite e os tipos por conta própria.

## Provisionar ou corrigir o bucket

```bash
pnpm storage:setup   # lê apps/api/.env; só dev/staging; idempotente
```

- Cria o bucket ou reaplica a configuração (inclusive volta a **privado** se alguém abriu no painel).
- Recusa produção (`APP_ENV=production` ou `SUPABASE_URL` igual ao projeto de produção) e chave que
  não seja a secreta. Produção: pelo pipeline de deploy (CF-015), nunca da máquina pessoal.
- Mudou a especificação? Rode de novo em cada ambiente.

## Conferir

- `/status` → **Arquivos privados (CF-162)**: saudável só com o bucket existente e privado.
- Nenhuma policy em `storage.objects` libera o bucket para `anon`/`authenticated`: só a API (service
  role) lê e grava. Não criar policy de leitura direta para membros.

## Rollback

Remover o bucket apaga os arquivos: só com backup e autorização do Luiggi. Para "desligar"
downloads, basta a API não emitir links (o bucket privado continua inacessível sem eles).

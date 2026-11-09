// Função única da API na Vercel (P-014): o NestJS compilado em dist/ atende todas as rotas
// (o vercel.json reescreve tudo para /api). Ver docs/runbooks/deploy.md.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- a função da Vercel é CommonJS, como o dist/
module.exports = require('../dist/serverless.js').handler;

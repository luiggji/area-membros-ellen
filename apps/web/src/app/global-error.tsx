'use client';

import './globals.css';

import { Button, ErrorState } from '@caixa-forte/ui';

import { errorReference } from '@/shared/lib/error-reference';

/**
 * Erro no próprio layout raiz (CF-157): substitui o documento inteiro, então define `<html>` e
 * `<body>` e importa os tokens. Fontes da marca não carregam aqui (fallback Georgia/system-ui).
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-cf-bg font-sans text-cf-text antialiased">
        <title>Erro · Caixa Forte</title>
        <main className="px-4">
          <ErrorState
            size="page"
            title="A Caixa Forte não carregou."
            description="Tente novamente em instantes. Se continuar, fale com o suporte informando o código abaixo."
            reference={errorReference(error)}
            action={<Button onClick={() => retry()}>Tentar novamente</Button>}
          />
        </main>
      </body>
    </html>
  );
}

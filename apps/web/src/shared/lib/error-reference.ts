/**
 * Identificador seguro de um erro para mostrar ao usuário (CF-157): só o `digest` gerado pelo
 * Next. A mensagem real nunca vai para a tela; fica nos logs do servidor.
 */
export function errorReference(error: unknown): string | undefined {
  if (error instanceof Error && 'digest' in error && typeof error.digest === 'string') {
    return error.digest;
  }
  return undefined;
}

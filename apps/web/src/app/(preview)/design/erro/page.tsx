/**
 * Dispara um erro de propósito para ver e testar a tela de erro real (CF-157). Só existe com as
 * rotas internas ligadas (grupo `(preview)`, bloqueado em produção).
 */
export default function SimulatedErrorPage(): never {
  throw new Error('Erro simulado em /design/erro (CF-157)');
}

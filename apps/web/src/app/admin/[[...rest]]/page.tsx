import { notFound } from 'next/navigation';

/**
 * Rotas ainda inexistentes desta área respondem 404 dentro do layout dinâmico (com nonce), e não
 * pela 404 estática da raiz. Quando a primeira página real chegar, trocar por `[...rest]`.
 */
export default function NotFoundInPrivateArea(): never {
  notFound();
}

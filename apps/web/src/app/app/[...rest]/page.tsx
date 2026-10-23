import { notFound } from 'next/navigation';

/**
 * Rotas ainda inexistentes desta área respondem 404 dentro do layout dinâmico (com nonce), e não
 * pela 404 estática da raiz.
 */
export default function NotFoundInPrivateArea(): never {
  notFound();
}

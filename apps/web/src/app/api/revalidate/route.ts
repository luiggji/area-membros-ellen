import { revalidateTag } from 'next/cache';

import { handleRevalidate } from '@/shared/lib/cache/revalidate-handler';

/** Revalidação das páginas públicas pedida pela API (CF-163). Lógica em revalidate-handler. */
export async function POST(request: Request) {
  return handleRevalidate(request, {
    secret: process.env.REVALIDATE_SECRET,
    revalidate: (tag, profile) => revalidateTag(tag, profile),
  });
}

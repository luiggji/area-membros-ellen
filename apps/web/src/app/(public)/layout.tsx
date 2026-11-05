import type { ReactNode } from 'react';

import { PublicFrame } from '@/shared/ui/public-frame';

/** Layout público (landing, planos, `/eventos/[slug]`). */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicFrame>{children}</PublicFrame>;
}

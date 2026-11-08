import { notFound } from 'next/navigation';

import { findMember } from '@/modules/prototype/domain/community-fixtures';
import { MemberProfileScreen } from '@/modules/prototype/presentation/community-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Perfil do diretório no protótipo (CF-175). */
export default async function PrototypeMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const member = findMember((await params).id);
  if (!member) notFound();
  return (
    <PrototypeShell>
      <MemberProfileScreen member={member} />
    </PrototypeShell>
  );
}

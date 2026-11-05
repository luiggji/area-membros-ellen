import type { MemberMaterials } from '@caixa-forte/contracts';

type Material = MemberMaterials['materials'][number];

/** Materiais por assunto, na ordem alfabética do assunto (a API já ordena por título). */
export function groupBySubject(materials: Material[]): { subject: string; items: Material[] }[] {
  const groups = new Map<string, Material[]>();
  for (const material of materials) {
    groups.set(material.subject, [...(groups.get(material.subject) ?? []), material]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([subject, items]) => ({ subject, items }));
}

const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** "340 KB", "2,4 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${number.format(bytes / (1024 * 1024))} MB`;
}

/** "Revisado em 20/10/2026" a partir da data (sem fuso: é só o dia). */
export function revisedText(revisedOn: string | null): string | null {
  const match = revisedOn && /^(\d{4})-(\d{2})-(\d{2})$/.exec(revisedOn);
  return match ? `Revisado em ${match[3]}/${match[2]}/${match[1]}` : null;
}

/** "PDF · 2,4 MB · versão 2 · Revisado em 20/10/2026" — só o que existe. */
export function materialFacts(material: Material): string {
  return [
    material.kind,
    formatSize(material.sizeBytes),
    `versão ${material.version}`,
    revisedText(material.revisedOn),
  ]
    .filter(Boolean)
    .join(' · ');
}

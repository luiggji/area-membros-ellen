/** Instante de um timestamp do banco; texto sem fuso é UTC, nunca a hora local do servidor. */
export function parseTimestamp(value: string): Date {
  const hasZone = /(z|[+-]\d{2}(:?\d{2})?)$/i.test(value.trim());
  return new Date(hasZone ? value : `${value.trim().replace(' ', 'T')}Z`);
}

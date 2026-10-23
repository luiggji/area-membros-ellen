export const DEFAULT_AFTER_LOGIN = '/app';

/**
 * Destino depois do login/callback (`?next=`), só dentro do próprio site: evita open redirect
 * (`//outro.site`, `https://…`, `/\outro`, `javascript:`).
 */
export function safeNext(value: string | null | undefined, fallback = DEFAULT_AFTER_LOGIN): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  // Barra invertida ou controle no meio também podem ser lidos como outra origem por navegadores.
  if (/[\\\u0000-\u001f]/.test(value)) return fallback;
  return value;
}

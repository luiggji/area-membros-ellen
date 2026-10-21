import base from '@caixa-forte/config/eslint/base';

// database.types.ts é gerado pelo Supabase CLI (CF-156): fica fora do lint e não é editado à mão.
export default [{ ignores: ['src/database.types.ts'] }, ...base];

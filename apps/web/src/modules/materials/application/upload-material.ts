import { createMaterialRequestSchema, type CreateMaterialRequest } from '@caixa-forte/contracts';

/** Resposta de uma chamada da API do Cofre (via Server Action). */
export type MaterialApiResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status: number; code?: string; fields?: Record<string, string> };

export interface UploadDeps {
  prepare(file: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<MaterialApiResult<{ key: string; uploadUrl: string }>>;
  /** Envia o arquivo direto ao bucket pelo link de uso único; `true` = chegou. */
  put(uploadUrl: string, file: Blob, mimeType: string): Promise<boolean>;
  create(body: CreateMaterialRequest): Promise<MaterialApiResult<{ id: string }>>;
}

export type UploadState =
  | { status: 'idle' }
  | { status: 'error'; message?: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

const REJECTIONS: Record<string, string> = {
  upload_empty: 'O arquivo está vazio.',
  upload_too_large: 'Arquivo acima de 25 MB.',
  upload_type_not_allowed:
    'Tipo de arquivo não aceito. Use PDF, Word, Excel, PowerPoint, PNG ou JPEG.',
  upload_extension_mismatch: 'A extensão do arquivo não corresponde ao tipo dele.',
  upload_content_mismatch: 'O conteúdo do arquivo não é do tipo informado. Nada foi publicado.',
  upload_missing: 'O arquivo não chegou ao Cofre. Envie de novo.',
  upload_key_mismatch: 'O envio não confere com o arquivo escolhido. Envie de novo.',
  course_not_found: 'O curso escolhido não existe mais. Recarregue a página.',
};

function apiError(result: Extract<MaterialApiResult, { ok: false }>): UploadState {
  if (result.fields) return { status: 'error', fieldErrors: result.fields };
  if (result.code && REJECTIONS[result.code]) {
    return { status: 'error', fieldErrors: { file: REJECTIONS[result.code]! } };
  }
  if (result.status === 401 || result.status === 403) {
    return {
      status: 'error',
      message: 'Sua sessão não tem permissão. Entre de novo com a verificação em duas etapas.',
    };
  }
  return { status: 'error', message: 'Não foi possível enviar agora. Tente novamente.' };
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * Envio de material (CF-085), na ordem: confere os metadados (nada sobe com formulário inválido),
 * pede o link de uso único, envia o arquivo direto ao bucket e cria o material em rascunho.
 */
export async function uploadMaterial(
  deps: UploadDeps,
  file: File | null,
  form: Record<string, unknown>,
): Promise<UploadState> {
  const metadata = {
    title: text(form.title),
    description: text(form.description),
    subject: text(form.subject),
    version: text(form.version),
    license: text(form.license),
    revisedOn: text(form.revisedOn) || null,
    courseId: text(form.courseId) || null,
  };
  const parsed = createMaterialRequestSchema.safeParse({
    ...metadata,
    key: '00000000-0000-4000-8000-000000000000.pdf',
    fileName: file?.name ?? '',
  });
  const errors: Record<string, string> = {};
  if (!file || file.size === 0) errors.file = 'Escolha um arquivo.';
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      errors[field === 'fileName' ? 'file' : field] ??= issue.message;
    }
  }
  if (!file || Object.keys(errors).length > 0) return { status: 'error', fieldErrors: errors };

  const prepared = await deps.prepare({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });
  if (!prepared.ok) {
    const failure = apiError(prepared);
    // Erro de validação do 1º passo é sempre sobre o arquivo (nome, tipo ou tamanho).
    return prepared.fields
      ? { status: 'error', fieldErrors: { file: Object.values(prepared.fields)[0]! } }
      : failure;
  }
  if (!(await deps.put(prepared.data.uploadUrl, file, file.type))) {
    return {
      status: 'error',
      message: 'O envio do arquivo falhou. Confira a conexão e tente de novo.',
    };
  }
  const created = await deps.create({
    ...metadata,
    key: prepared.data.key,
    fileName: file.name,
  } as CreateMaterialRequest);
  if (!created.ok) return apiError(created);
  return { status: 'success', message: `Material “${metadata.title.trim()}” enviado em rascunho.` };
}

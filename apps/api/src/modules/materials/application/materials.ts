import {
  AdminMaterial,
  CreateMaterialRequest,
  MATERIAL_KINDS,
  MemberMaterials,
} from '@caixa-forte/contracts';

import {
  confirmMaterialUpload,
  FileStorage,
  materialDownload,
  UploadRejection,
} from '../../files/application/file-storage';
import { extensionOf } from '../../files/domain/upload-policy';
import { AccessReader } from '../../membership/application/ports';

/** Material como está no banco (sem nada calculado). */
export interface MaterialRow {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  version: string;
  license: string | null;
  revisedOn: string | null;
  course: { slug: string; title: string } | null;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: 'draft' | 'published';
  publishedAt: string | null;
}

export type NewMaterial = Omit<MaterialRow, 'id' | 'course' | 'status' | 'publishedAt'> & {
  courseId: string | null;
};

/** Cofre (CF-085): só a API lê e grava a tabela `materials`. Excluídos nunca voltam nas listas. */
export interface MaterialStore {
  list(scope: 'published' | 'all'): Promise<MaterialRow[]>;
  create(material: NewMaterial): Promise<{ id: string } | 'course_not_found'>;
  /** Publicar guarda a primeira data de publicação; despublicar mantém a data. */
  setStatus(id: string, status: 'draft' | 'published', now: Date): Promise<boolean>;
  /** Exclusão lógica: devolve a chave do arquivo para tirá-lo do bucket; `null` = não existe. */
  softDelete(id: string, now: Date): Promise<{ storageKey: string; title: string } | null>;
}
export const MATERIAL_STORE = Symbol('MATERIAL_STORE');

const view = (row: MaterialRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  subject: row.subject,
  kind: MATERIAL_KINDS[row.mimeType as keyof typeof MATERIAL_KINDS] ?? 'Arquivo',
  extension: extensionOf(row.storageKey),
  sizeBytes: row.sizeBytes,
  version: row.version,
  license: row.license,
  revisedOn: row.revisedOn,
  course: row.course,
});

/** Cofre do membro: publicados, por assunto; baixar só com acesso pago vigente. */
export async function memberMaterials(
  deps: { store: MaterialStore; access: AccessReader },
  viewerId: string,
): Promise<MemberMaterials> {
  const [rows, access] = await Promise.all([
    deps.store.list('published'),
    deps.access.accessOf(viewerId, 'caixa_forte'),
  ]);
  return {
    canDownload: access !== null,
    materials: rows.map((row) => ({ ...view(row), publishedAt: row.publishedAt ?? '' })),
  };
}

export async function adminMaterials(store: MaterialStore): Promise<AdminMaterial[]> {
  return (await store.list('all')).map((row) => ({
    ...view(row),
    fileName: row.fileName,
    status: row.status,
    publishedAt: row.publishedAt,
  }));
}

/** Link de 60 s para um material publicado; quem chama já passou pelo paywall (`@RequireAccess`). */
export async function downloadMaterial(
  deps: { store: MaterialStore; storage: FileStorage },
  id: string,
  now: Date,
) {
  const material = (await deps.store.list('published')).find((row) => row.id === id);
  if (!material) return null;
  return materialDownload(
    deps.storage,
    { key: material.storageKey, fileName: material.fileName },
    now,
  );
}

/**
 * 2º passo do envio: confere o arquivo no bucket e cria o material em rascunho. Arquivo recusado
 * já sai do bucket; curso inexistente também apaga o arquivo enviado.
 */
export async function createMaterial(
  deps: { store: MaterialStore; storage: FileStorage },
  input: CreateMaterialRequest,
): Promise<
  { id: string } | { rejected: UploadRejection | 'missing' | 'key_mismatch' } | 'course_not_found'
> {
  const upload = await confirmMaterialUpload(deps.storage, input.key, input.fileName);
  if (!('ok' in upload)) return upload;
  const created = await deps.store.create({
    title: input.title,
    description: input.description || null,
    subject: input.subject,
    version: input.version,
    license: input.license || null,
    revisedOn: input.revisedOn,
    courseId: input.courseId,
    storageKey: input.key,
    fileName: input.fileName,
    mimeType: upload.mimeType,
    sizeBytes: upload.sizeBytes,
  });
  if (created === 'course_not_found') await deps.storage.remove(input.key);
  return created;
}

/** Exclusão pela equipe: registro e auditoria ficam; o arquivo sai do bucket. */
export async function deleteMaterial(
  deps: { store: MaterialStore; storage: FileStorage },
  id: string,
  now: Date,
): Promise<{ title: string; fileRemoved: boolean } | null> {
  const deleted = await deps.store.softDelete(id, now);
  if (!deleted) return null;
  // Falha do Storage não desfaz a exclusão nem impede a auditoria: o arquivo continua privado e
  // sem link (o registro já está excluído); `fileRemoved: false` fica na trilha para a limpeza.
  const fileRemoved = await deps.storage.remove(deleted.storageKey).then(
    () => true,
    () => false,
  );
  return { title: deleted.title, fileRemoved };
}

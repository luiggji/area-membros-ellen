import { Button, Card } from '@caixa-forte/ui';
import { FileText } from 'lucide-react';

import { exampleMaterials, MATERIAL_CATEGORIES } from '../domain/learning-fixtures';
import { hrefFor } from './nav-links';
import { ExampleTag, LinkTabs, PageHeader, PrototypePage } from './page-parts';

export function parseVaultCategory(value: unknown): string {
  return MATERIAL_CATEGORIES.find((category) => category.toLowerCase() === value) ?? 'todos';
}

/** Cofre de Materiais: modelos, checklists e guias por categoria, com o curso de origem. */
export function VaultScreen({ category }: { category: string }) {
  const items =
    category === 'todos'
      ? exampleMaterials
      : exampleMaterials.filter((item) => item.category === category);
  const tabs = [
    { value: 'todos', label: 'Todos', href: hrefFor('cofre') },
    ...MATERIAL_CATEGORIES.map((name) => ({
      value: name,
      label: name,
      href: `${hrefFor('cofre')}?categoria=${name.toLowerCase()}`,
    })),
  ];

  return (
    <PrototypePage>
      <PageHeader
        title="Cofre de Materiais"
        summary="Modelos, checklists e guias para usar no dia a dia do escritório."
      >
        <LinkTabs label="Categorias do Cofre" items={tabs} current={category} />
      </PageHeader>
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card as="li" key={item.title} className="flex items-start gap-4">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary"
            >
              <FileText className="size-5" strokeWidth={1.6} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="flex flex-wrap items-center gap-2 font-medium text-cf-text">
                {item.title} <ExampleTag />
              </p>
              <p className="text-sm text-cf-text-secondary">
                {item.category} · {item.format} · {item.size}
                {item.course && ` · do curso ${item.course}`}
              </p>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  disabled
                  title="No protótipo não há arquivo; no produto o download é autorizado no servidor"
                >
                  Baixar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </ul>
    </PrototypePage>
  );
}

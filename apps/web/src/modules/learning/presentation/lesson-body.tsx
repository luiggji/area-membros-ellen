import { type InlineSpan, parseMarkdown } from '../domain/lesson-markdown';

function Spans({ spans }: { spans: InlineSpan[] }) {
  return spans.map((span, index) =>
    span.bold ? (
      <strong key={index} className="font-semibold text-cf-text">
        {span.text}
      </strong>
    ) : span.italic ? (
      <em key={index}>{span.text}</em>
    ) : (
      <span key={index}>{span.text}</span>
    ),
  );
}

const headingClass = {
  2: 'font-editorial text-2xl tracking-tight text-cf-text',
  3: 'text-lg font-medium text-cf-text',
  4: 'text-base font-medium text-cf-text',
} as const;

/** Texto da aula: só elementos React montados a partir do Markdown (nunca HTML cru). */
export function LessonBody({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-4 leading-relaxed text-cf-text-secondary">
      {parseMarkdown(source).map((block, index) => {
        if (block.type === 'heading') {
          const Tag = `h${block.level}` as const;
          return (
            <Tag key={index} className={`${headingClass[block.level]} pt-2`}>
              <Spans spans={block.spans} />
            </Tag>
          );
        }
        if (block.type === 'list') {
          const List = block.ordered ? 'ol' : 'ul';
          return (
            <List
              key={index}
              className={`flex flex-col gap-1 pl-6 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
            >
              {block.items.map((item, i) => (
                <li key={i}>
                  <Spans spans={item} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={index}>
            <Spans spans={block.spans} />
          </p>
        );
      })}
    </div>
  );
}

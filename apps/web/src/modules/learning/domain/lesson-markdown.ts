/**
 * Markdown do texto da aula (CF-083), num subconjunto pequeno: títulos (#, ##, ###), parágrafos,
 * listas (- e 1.), **negrito** e *itálico*. Vira dados, e a tela monta elementos React a partir
 * deles: nenhum HTML do texto chega ao navegador, então não há como injetar script.
 */
export interface InlineSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3 | 4; spans: InlineSpan[] }
  | { type: 'paragraph'; spans: InlineSpan[] }
  | { type: 'list'; ordered: boolean; items: InlineSpan[][] };

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

export function parseInline(text: string): InlineSpan[] {
  return text
    .split(INLINE)
    .filter((part) => part !== '')
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return { text: part.slice(2, -2), bold: true };
      }
      if (/^(\*[^*].*\*|_[^_].*_)$/.test(part)) return { text: part.slice(1, -1), italic: true };
      return { text: part };
    });
}

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;

export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: 'paragraph', spans: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };

  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    const heading = HEADING.exec(line);
    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      const level = Math.min(heading[1]!.length + 1, 4) as 2 | 3 | 4;
      blocks.push({ type: 'heading', level, spans: parseInline(heading[2]!) });
    } else if (bullet || numbered) {
      flush();
      const ordered = Boolean(numbered);
      const item = parseInline((bullet ?? numbered)![1]!);
      const last = blocks.at(-1);
      if (last?.type === 'list' && last.ordered === ordered) last.items.push(item);
      else blocks.push({ type: 'list', ordered, items: [item] });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

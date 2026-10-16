/**
 * Render a Markdown snippet with the same typesetting as the write-up pages.
 * Used on the home page for a write-up's summary and its featured table.
 */
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { proseTables, inlineFlags } from '../markdown/plugins.mjs';

type Renderer = Awaited<ReturnType<typeof createSatteriMarkdownProcessor>>;
let renderer: Promise<Renderer> | undefined;

export async function renderMarkdown(markdown: string): Promise<string> {
  renderer ??= createSatteriMarkdownProcessor({
    syntaxHighlight: false,
    hastPlugins: [proseTables(), inlineFlags()],
    features: { gfm: true, smartPunctuation: false },
  });
  const { code } = await (await renderer).render(markdown);
  return code;
}

/** The first table under a heading (any level) whose text matches `heading`. */
export function tableUnderHeading(markdown: string, heading: string): string | null {
  const lines = markdown.split('\n');
  const isHeading = (l: string) => /^#{1,6}\s+/.test(l);
  const start = lines.findIndex((l) => isHeading(l) && l.replace(/^#{1,6}\s+/, '').trim() === heading.trim());
  if (start < 0) return null;
  let i = start + 1;
  while (i < lines.length && !isHeading(lines[i]) && !lines[i].trim().startsWith('|')) i++;
  const table: string[] = [];
  while (i < lines.length && lines[i].trim().startsWith('|')) table.push(lines[i++]);
  return table.length >= 2 ? table.join('\n') : null;
}

/** The first paragraph of a Markdown document, skipping a leading `# Title`. */
export function firstParagraph(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length && (lines[i].trim() === '' || /^#\s/.test(lines[i]))) i++;
  const para: string[] = [];
  while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|>|\||```|- |\* |\d+\.\s)/.test(lines[i])) {
    para.push(lines[i++]);
  }
  return para.join('\n');
}

/** Home page summary for a write-up: its `summary` field, or its first paragraph. */
export function summaryOf(entry: { data: { summary?: string }; body?: string }): string {
  return entry.data.summary ?? firstParagraph(entry.body ?? '');
}

/** Markdown inline syntax removed, for meta descriptions. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

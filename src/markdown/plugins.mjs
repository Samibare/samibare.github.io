/**
 * Typesetting for Markdown write-ups.
 *
 * These plugins change how the text is presented, never what it says:
 * no words are added, removed, or reworded. They add classes, ids,
 * wrappers, and table structure so the CSS in src/styles/prose.css can
 * style the output.
 *
 * Sätteri hast plugins: https://satteri.bruits.org/docs/plugins/
 */
import GithubSlugger from 'github-slugger';

/* ------------------------------------------------------------ helpers */

const h = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const t = (value) => ({ type: 'text', value });
const isEl = (n, tag) => n?.type === 'element' && (!tag || n.tagName === tag);

/** Detached deep copy of a node read during a visit. */
function clone(n) {
  const out = { type: n.type };
  if (n.tagName) out.tagName = n.tagName;
  if (n.properties) out.properties = { ...n.properties };
  if ('value' in n && n.value != null) out.value = n.value;
  if (n.children) out.children = n.children.map(clone);
  return out;
}

function textOf(n) {
  if (!n) return '';
  if (n.type === 'text') return n.value;
  return (n.children ?? []).map(textOf).join('');
}

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

function addClass(props, ...names) {
  const existing = Array.isArray(props.className) ? props.className : props.className ? [props.className] : [];
  return { ...props, className: [...existing, ...names.filter(Boolean)] };
}

/* ------------------------------------------------- document structure */

const CALLOUTS = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };

/**
 * - The first `# Heading` is hidden when it repeats the page title.
 *   Any other `#` heading becomes `<h2>`, because the page already has an `<h1>`.
 * - A paragraph that starts with a bold label ending in a colon, with the
 *   text on the next line (`**Method:**`), is marked as a section label.
 * - Headings and section labels get ids and are collected for the contents list.
 * - GitHub alerts (`> [!NOTE]`) become callouts, as they do on GitHub.
 */
export function proseStructure() {
  return () => {
    const slugger = new GithubSlugger();
    const toc = [];
    let seenH1 = false;

    return {
      name: 'prose-structure',
      element: [
        {
          filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
          visit(node, ctx) {
            const text = ctx.textContent(node).trim();
            if (node.tagName === 'h1') {
              const title = ctx.data.astro?.frontmatter?.title;
              const first = !seenH1;
              seenH1 = true;
              if (first && title && norm(title) === norm(text)) {
                ctx.removeNode(node);
                return;
              }
              const id = slugger.slug(text);
              toc.push({ depth: 2, id, text });
              return h('h2', { ...node.properties, id }, node.children.map(clone));
            }
            const depth = Number(node.tagName[1]);
            const id = typeof node.properties?.id === 'string' ? node.properties.id : slugger.slug(text);
            ctx.setProperty(node, 'id', id);
            if (depth <= 3) toc.push({ depth, id, text });
          },
        },
        {
          filter: ['p'],
          visit(node, ctx) {
            const [first, next] = node.children ?? [];
            if (!isEl(first, 'strong')) return;
            const label = ctx.textContent(first).trim();
            if (!label.endsWith(':')) return;
            const standsAlone =
              !next || isEl(next, 'br') || (next.type === 'text' && /^[ \t]*\n/.test(next.value));
            if (!standsAlone) return;
            const text = label.replace(/:\s*$/, '');
            const id = slugger.slug(text);
            ctx.setProperty(node, 'id', id);
            ctx.setProperty(node, 'className', ['section-label']);
            toc.push({ depth: 3, id, text });
          },
        },
        {
          filter: ['blockquote'],
          visit(node) {
            const kids = node.children.map(clone);
            const firstP = kids.find((k) => isEl(k));
            if (!isEl(firstP, 'p')) return;
            const lead = firstP.children[0];
            if (lead?.type !== 'text') return;
            const m = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|$)/i.exec(lead.value);
            if (!m) return;
            const kind = m[1].toLowerCase();
            lead.value = lead.value.slice(m[0].length);
            const body = kids.filter((k) => k !== firstP || textOf(k).trim() !== '');
            return h('div', { className: ['callout', `callout-${kind}`], role: 'note' }, [
              h('p', { className: ['callout-title'] }, [t(CALLOUTS[kind])]),
              ...body,
            ]);
          },
        },
      ],
      after(_root, ctx) {
        const fm = ctx.data.astro?.frontmatter;
        if (fm) fm.toc = toc;
      },
    };
  };
}

/* --------------------------------------------------------------- tables */

const OUTCOMES = new Map([
  ['false assurance', 'o-assurance'],
  ['false alarm', 'o-alarm'],
  ['ok', 'o-agree'],
  ['no mismatch', 'o-agree'],
  ['executable', 'rt-exec'],
  ['stack executable', 'rt-exec'],
  ['non-exec', 'rt-noexec'],
  ['non-executable', 'rt-noexec'],
  ['stack non-executable', 'rt-noexec'],
]);

/**
 * Tables:
 * - Wrapped in a scrollable region so wide tables never widen the page.
 * - A header row with text only in its first cell (how Google Docs exports
 *   a table title) becomes the table's caption, and the next row becomes the header.
 * - The first cell of each row becomes a row header.
 * - Cells reading "False assurance", "False alarm", "OK"/"No mismatch",
 *   and runtime results get classes for their markers.
 */
export function proseTables() {
  return () => {
    let count = 0;
    return {
      name: 'prose-tables',
      element: {
        filter: ['table'],
        visit(node) {
          count += 1;
          const id = `table-${count}`;
          const table = clone(node);
          const sections = table.children.filter((c) => isEl(c));
          const thead = sections.find((s) => s.tagName === 'thead');
          const tbody = sections.find((s) => s.tagName === 'tbody');
          const rowsOf = (sec) => (sec?.children ?? []).filter((r) => isEl(r, 'tr'));
          const cellsOf = (row) => (row?.children ?? []).filter((c) => isEl(c, 'td') || isEl(c, 'th'));

          let headRow = rowsOf(thead)[0];
          let bodyRows = rowsOf(tbody);
          let caption = null;

          const headCells = cellsOf(headRow);
          const looksLikeTitleRow =
            headCells.length > 1 &&
            textOf(headCells[0]).trim() !== '' &&
            headCells.slice(1).every((c) => textOf(c).trim() === '') &&
            bodyRows.length > 1;
          if (looksLikeTitleRow) {
            caption = headCells[0].children;
            headRow = bodyRows[0];
            bodyRows = bodyRows.slice(1);
          }

          const head = headRow
            ? h('tr', {}, cellsOf(headRow).map((c) => {
                const flags = /^[RWE_&\-\s]+$/.test(textOf(c).trim()) && textOf(c).trim() !== '';
                return h('th', addClass({ ...c.properties, scope: 'col' }, flags && 'flags'), c.children);
              }))
            : null;

          const body = bodyRows.map((r) => {
            const [first, ...rest] = cellsOf(r);
            const label = norm(textOf(first));
            const rowClass = /^(linux kernel|kernel\s*\/\s*run\s*time)/.test(label)
              ? 'row-ref'
              : label === 'mismatch'
                ? 'row-outcome'
                : null;
            return h('tr', rowClass ? { className: [rowClass] } : {}, [
              h('th', { ...(first?.properties ?? {}), scope: 'row' }, first?.children ?? []),
              ...rest.map((c) => {
                const kind = OUTCOMES.get(norm(textOf(c)));
                const short = kind && textOf(c).trim().length <= 12;
                return h('td', addClass(c.properties ?? {}, kind, short && 'nowrap'), c.children);
              }),
            ]);
          });

          const out = h('table', {}, [
            ...(caption ? [h('caption', { id: `${id}-caption` }, caption)] : []),
            ...(head ? [h('thead', {}, [head])] : []),
            h('tbody', {}, body),
          ]);
          const label = caption ? { ariaLabelledBy: `${id}-caption` } : { ariaLabel: `Table ${count}` };
          return h('div', { className: ['table-wrap'], role: 'region', tabIndex: 0, ...label }, [out]);
        },
      },
    };
  };
}

/* ---------------------------------------------------------- inline code */

const FLAG_TOKEN = /^(?:[R_][W_][E_]|RWE|RW|R|W|E)$/;

/**
 * Inline code that is an ELF segment flag string (`RWE`, `RW_`, `__E`, `E`)
 * gets its execute letter marked, matching the program header figure.
 */
export function inlineFlags() {
  return {
    name: 'inline-flags',
    element: {
      filter: ['code'],
      visit(node, ctx) {
        if (isEl(ctx.parent(node), 'pre')) return;
        const text = ctx.textContent(node);
        if (!FLAG_TOKEN.test(text) || !text.includes('E')) return;
        const children = [...text].map((ch) => (ch === 'E' ? h('span', { className: ['x'] }, [t(ch)]) : t(ch)));
        return h('code', addClass(node.properties ?? {}, 'flags'), children);
      },
    },
  };
}

/* ---------------------------------------------------------- code blocks */

/**
 * Optional settings on a fenced code block, written after the language:
 *
 *   ```c title="fs/binfmt_elf.c" start=939 {943-947}
 *
 * - title="…"   label shown above the block
 * - start=N     show line numbers, starting at N
 * - numbers     show line numbers, starting at 1
 * - {3,5-7}     highlight these lines
 */
export function codeFrame() {
  return {
    name: 'code-frame',
    preprocess(code, options) {
      const raw = options.meta?.__raw ?? '';
      const title = /\btitle="([^"]*)"/.exec(raw)?.[1];
      const startMatch = /\bstart=(\d+)/.exec(raw);
      const start = startMatch ? Number(startMatch[1]) : /\bnumbers\b/.test(raw) ? 1 : null;
      const marked = new Set();
      const ranges = /\{([\d,\s-]+)\}/.exec(raw.replace(/title="[^"]*"/, ''))?.[1];
      if (ranges) {
        for (const part of ranges.split(',')) {
          const [a, b] = part.trim().split('-').map(Number);
          if (Number.isFinite(a)) for (let i = a; i <= (Number.isFinite(b) ? b : a); i++) marked.add(i);
        }
      }
      this.meta.frame = { title, start, marked, lang: options.lang };
    },
    code(node) {
      const { start } = this.meta.frame ?? {};
      if (start != null) node.properties.style = `counter-reset: line ${start - 1}`;
    },
    line(node, line) {
      const { start, marked } = this.meta.frame ?? {};
      if (!marked?.size) return;
      // With start=N, {…} uses the displayed line numbers; otherwise 1-based lines.
      const shown = start != null ? start + line - 1 : line;
      if (marked.has(shown)) this.addClassToHast(node, 'hl');
    },
    root(root) {
      const { title, start, lang } = this.meta.frame ?? {};
      const pre = root.children.find((c) => isEl(c, 'pre'));
      if (!pre) return;
      if (start != null) this.addClassToHast(pre, 'numbered');
      const showLang = lang && !['plaintext', 'text', 'txt', 'plain'].includes(lang);
      const head =
        title || showLang
          ? [h('figcaption', { className: ['code-head'] }, [
              ...(title ? [h('span', { className: ['code-title'] }, [t(title)])] : []),
              ...(showLang ? [h('span', { className: ['code-lang'] }, [t(lang)])] : []),
            ])]
          : [];
      root.children = [h('figure', { className: ['code-frame'] }, [...head, pre])];
    },
  };
}

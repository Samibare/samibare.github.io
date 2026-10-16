import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Research write-ups. One Markdown file per write-up in src/content/research/.
 * The text under the frontmatter is published exactly as written.
 * See WRITING.md for the fields and the formatting the site understands.
 */
const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /**
     * Shown under the title on the home page. Optional: when it is left out,
     * the first paragraph of the write-up is used, so the two never drift apart.
     */
    summary: z.string().optional(),
    /** Repository link shown at the top of the page. */
    repo: z.string().url().optional(),
    /** Show the table under this heading on the home page, e.g. "Result". */
    homeTable: z.string().optional(),
    /** Used for ordering when there is more than one write-up. */
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

/**
 * CTF writeups. Add a Markdown file to src/content/writeups/ to publish one.
 * The Writeups page and nav link appear once at least one has `draft: false`.
 */

//const writeups = defineCollection({
//  loader: glob({ base: './src/content/writeups', pattern: '**/*.md' }),
//  schema: z.object({
//    title: z.string(),
    /** One sentence shown in the list. */
//    summary: z.string(),
//    date: z.coerce.date(),
    /** Competition or platform, e.g. 'National Cyber League, Spring 2027'. */
//    event: z.string(),
//    category: z.enum(['pwn', 'reversing', 'crypto', 'web', 'forensics', 'misc']),
//    draft: z.boolean().default(false),
//  }),
//});

export const collections = { research};

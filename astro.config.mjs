// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { proseStructure, proseTables, inlineFlags, codeFrame } from './src/markdown/plugins.mjs';
import stockTheme from './src/markdown/theme.mjs';

// The site is served from a user site (Samibare/samibare.github.io) on a custom
// domain, so it lives at the root: no `base` is needed. If you ever move it to a
// project repo without the custom domain, set `base: '/<repo-name>'`.
export default defineConfig({
  site: 'https://goukiwilliams.com',
  trailingSlash: 'always',
  // Keep source whitespace so inline elements that start a new line keep their leading space.
  compressHTML: false,
  build: {
    format: 'directory',
    // Keep CSS in files so the Content-Security-Policy stays simple.
    inlineStylesheets: 'never',
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  markdown: {
    processor: satteri({
      // Publish text exactly as written: no automatic curly quotes or dashes.
      features: { smartPunctuation: false },
      hastPlugins: [proseStructure(), proseTables(), inlineFlags()],
    }),
    shikiConfig: {
      theme: stockTheme,
      transformers: [codeFrame()],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

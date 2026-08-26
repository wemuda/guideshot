import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { docsNavigation, docsNeighbors } from '../lib/docs-navigation';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('documentation journey', () => {
  it('links every page in a complete previous and next sequence', () => {
    expect(docsNavigation.map((item) => item.href)).toEqual([
      '/docs',
      '/docs/getting-started',
      '/docs/concepts',
      '/docs/recipes',
      '/docs/packages',
      '/docs/cli',
      '/docs/security',
    ]);

    for (const [index, item] of docsNavigation.entries()) {
      const neighbors = docsNeighbors(item.href);
      expect(neighbors.previous).toEqual(docsNavigation[index - 1]);
      expect(neighbors.next).toEqual(docsNavigation[index + 1]);
    }
  });

  it('gives every documentation route an outcome and shared page shell', async () => {
    for (const item of docsNavigation) {
      const route =
        item.href === '/docs' ? '' : item.href.replace('/docs/', '');
      const source = await readFile(
        join(siteRoot, 'app', 'docs', route, 'page.tsx'),
        'utf8',
      );
      expect(source).toContain('<DocsPage');
      expect(source).toContain(`href="${item.href}"`);
      expect(source).toContain('description=');
    }
  });

  it('keeps highlighted examples and every package section discoverable', async () => {
    const codePages = ['', 'getting-started', 'recipes', 'cli'];
    for (const route of codePages) {
      const source = await readFile(
        join(siteRoot, 'app', 'docs', route, 'page.tsx'),
        'utf8',
      );
      expect(source).toContain('<HighlightedCode');
    }

    const packages = await readFile(
      join(siteRoot, 'app', 'docs', 'packages', 'page.tsx'),
      'utf8',
    );
    for (const packageName of [
      '@guideshot/schema',
      '@guideshot/core',
      '@guideshot/playwright',
      '@guideshot/renderer',
      '@guideshot/cli',
    ]) {
      expect(packages).toContain(packageName);
    }
  });
});

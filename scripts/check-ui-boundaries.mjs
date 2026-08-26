import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const siteRoot = join(root, 'apps/site');
const violations = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (relative(siteRoot, path) === 'components/ui') {
        violations.push('apps/site/components/ui must not exist');
        continue;
      }
      await walk(path);
      continue;
    }
    if (!['.ts', '.tsx', '.js', '.mjs'].includes(extname(path))) continue;
    const source = await readFile(path, 'utf8');
    if (
      source.includes("from 'lucide-react'") ||
      source.includes('from "lucide-react"')
    ) {
      violations.push(`${relative(root, path)} imports lucide-react`);
    }
    if (
      source.includes("from '@hugeicons/react'") ||
      source.includes('from "@hugeicons/react"')
    ) {
      violations.push(`${relative(root, path)} bypasses @guideshot/ui Icon`);
    }
  }
}

await walk(siteRoot);

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
}

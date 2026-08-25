#!/usr/bin/env node

import { existsSync } from 'node:fs';

const entrypoint = new URL('../dist/bin.js', import.meta.url);

if (!existsSync(entrypoint)) {
  console.error('GuideShot CLI is not built. Run `pnpm build` first.');
  process.exitCode = 1;
} else {
  await import(entrypoint.href);
}

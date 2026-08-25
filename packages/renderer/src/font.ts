import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
let interFont: Promise<Uint8Array> | undefined;

export function loadBundledFont(): Promise<Uint8Array> {
  interFont ??= readFile(
    require.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
  );
  return interFont;
}

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { sha256 } from '@guideshot/core';
import { afterEach, describe, expect, it } from 'vitest';

import { CompositionCache } from '../src/cache.js';
import { PNG, WEBP } from './helpers.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

describe('CompositionCache', () => {
  it('round-trips verified rendered assets and reports cache misses', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'guideshot-compositions-'));
    roots.push(root);
    const cache = new CompositionCache(root);
    const key = 'a'.repeat(64);

    expect(await cache.read(key)).toBeUndefined();
    await cache.write(key, {
      format: 'webp',
      mimeType: 'image/webp',
      bytes: WEBP,
      width: 1,
      height: 1,
      hash: sha256(WEBP),
    });

    await expect(cache.read(key)).resolves.toEqual({
      format: 'webp',
      mimeType: 'image/webp',
      bytes: WEBP,
      width: 1,
      height: 1,
      hash: sha256(WEBP),
    });
  });

  it('rejects modified cached composition bytes', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'guideshot-compositions-'));
    roots.push(root);
    const cache = new CompositionCache(root);
    const key = 'b'.repeat(64);
    await cache.write(key, {
      format: 'webp',
      mimeType: 'image/webp',
      bytes: WEBP,
      width: 1,
      height: 1,
      hash: sha256(WEBP),
    });
    await writeFile(path.join(root, 'compositions', key, 'asset.webp'), PNG);

    await expect(cache.read(key)).rejects.toMatchObject({
      code: 'OUTPUT_STALE',
    });
  });
});

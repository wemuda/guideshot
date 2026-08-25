import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  JSON_SCHEMA_DIALECT,
  PublicManifestSchema,
  RecipeSchema,
  schemaFiles,
  writeSchemas,
} from '../src/index.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('writeSchemas', () => {
  it('writes deterministic standalone JSON schema documents', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'guideshot-schema-'));
    temporaryDirectories.push(directory);

    const paths = await writeSchemas(directory);

    expect(paths.map((path) => path.split('/').at(-1))).toEqual([
      'manifest.schema.json',
      'recipe.schema.json',
    ]);
    expect(Object.keys(schemaFiles)).toEqual([
      'manifest.schema.json',
      'recipe.schema.json',
    ]);

    const manifest = JSON.parse(
      await readFile(join(directory, 'manifest.schema.json'), 'utf8'),
    ) as unknown;
    const recipe = JSON.parse(
      await readFile(join(directory, 'recipe.schema.json'), 'utf8'),
    ) as unknown;

    expect(manifest).toEqual(JSON.parse(JSON.stringify(PublicManifestSchema)));
    expect(recipe).toEqual(JSON.parse(JSON.stringify(RecipeSchema)));
    expect((manifest as { $schema: string }).$schema).toBe(JSON_SCHEMA_DIALECT);
    expect((recipe as { $schema: string }).$schema).toBe(JSON_SCHEMA_DIALECT);
  });
});

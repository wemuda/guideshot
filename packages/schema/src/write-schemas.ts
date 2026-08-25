import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { PublicManifestSchema, RecipeSchema } from './schemas.js';

export const schemaFiles = {
  'manifest.schema.json': PublicManifestSchema,
  'recipe.schema.json': RecipeSchema,
} as const;

export type SchemaFileName = keyof typeof schemaFiles;

export async function writeSchemas(
  outputDirectory: string,
): Promise<readonly string[]> {
  const directory = resolve(outputDirectory);
  await mkdir(directory, { recursive: true });

  return Promise.all(
    Object.entries(schemaFiles).map(async ([fileName, schema]) => {
      const path = resolve(directory, fileName);
      await writeFile(path, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
      return path;
    }),
  );
}

const entryPath = process.argv[1];

if (
  entryPath !== undefined &&
  import.meta.url === pathToFileURL(entryPath).href
) {
  const outputDirectory = process.argv[2];

  if (outputDirectory === undefined) {
    throw new Error('Usage: write-schemas <output-directory>');
  }

  await writeSchemas(outputDirectory);
}

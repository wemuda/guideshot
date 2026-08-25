import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { PublicManifestSchema, RecipeSchema } from './schemas.js';

export const schemaFiles = {
  'manifest.schema.json': PublicManifestSchema,
  'recipe.schema.json': RecipeSchema,
} as const;

export type SchemaFileName = keyof typeof schemaFiles;

const serializeSchema = (schema: (typeof schemaFiles)[SchemaFileName]) =>
  `${JSON.stringify(schema, null, 2)}\n`;

export async function writeSchemas(
  outputDirectory: string,
): Promise<readonly string[]> {
  const directory = resolve(outputDirectory);
  await mkdir(directory, { recursive: true });

  return Promise.all(
    Object.entries(schemaFiles).map(async ([fileName, schema]) => {
      const path = resolve(directory, fileName);
      await writeFile(path, serializeSchema(schema), 'utf8');
      return path;
    }),
  );
}

export async function verifySchemas(
  outputDirectory: string,
): Promise<readonly string[]> {
  const directory = resolve(outputDirectory);

  return Promise.all(
    Object.entries(schemaFiles).map(async ([fileName, schema]) => {
      const path = resolve(directory, fileName);
      let contents: string;

      try {
        contents = await readFile(path, 'utf8');
        JSON.parse(contents);
      } catch (error) {
        throw new Error(`Schema artifact is missing or invalid: ${path}`, {
          cause: error,
        });
      }

      if (contents !== serializeSchema(schema)) {
        throw new Error(`Schema artifact is stale: ${path}`);
      }

      return path;
    }),
  );
}

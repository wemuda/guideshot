import { readFile } from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';

import type { GuideShotConfig, RecipeSource } from './contracts.js';
import { GuideShotError } from './diagnostics.js';
import { parseRecipe } from './validation.js';

export async function discoverRecipes(
  config: Pick<GuideShotConfig, 'recipes'>,
  projectRoot: string,
): Promise<RecipeSource[]> {
  const root = path.resolve(projectRoot);
  const files = await fg([...config.recipes], {
    absolute: true,
    cwd: root,
    followSymbolicLinks: false,
    onlyFiles: true,
    unique: true,
  });
  files.sort(compareStrings);
  if (files.length === 0) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      'No recipe files matched the configured discovery patterns.',
    );
  }

  const sources = await Promise.all(
    files.map(async (file) => {
      assertInsideProject(root, file);
      const text = await readFile(file, 'utf8');
      return {
        file,
        recipe: parseRecipe(text, {
          file,
          format: file.toLowerCase().endsWith('.jsonc') ? 'jsonc' : 'json',
        }),
      } satisfies RecipeSource;
    }),
  );

  assertUniqueRecipeIds(sources);
  return sources;
}

export function assertUniqueRecipeIds(sources: readonly RecipeSource[]): void {
  const seen = new Map<string, string>();
  for (const source of sources) {
    const previous = seen.get(source.recipe.id);
    if (previous !== undefined) {
      throw new GuideShotError(
        'OUTPUT_COLLISION',
        `Recipe id "${source.recipe.id}" is declared more than once.`,
        {
          recipeId: source.recipe.id,
          location: { file: source.file },
          details: { previousFile: previous },
        },
      );
    }
    seen.set(source.recipe.id, source.file);
  }
}

function assertInsideProject(root: string, file: string): void {
  const relative = path.relative(root, file);
  if (
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      'Recipe discovery may not read outside the project root.',
      { location: { file } },
    );
  }
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

import { readFileSync, readdirSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const shotsDirectory = new URL('../shots/', import.meta.url);
const recipeFiles = readdirSync(shotsDirectory).filter((file) =>
  file.endsWith('.shot.json'),
);

describe('recipe schema URLs', () => {
  it.each(recipeFiles)('%s uses the canonical portable schema', (file) => {
    const recipe = JSON.parse(
      readFileSync(new URL(file, shotsDirectory), 'utf8'),
    ) as { $schema?: string };

    expect(recipe.$schema).toBe(
      'https://guideshot.dev.wemuda.com/schemas/recipe.v1.json',
    );
  });
});

import { describe, expect, it } from 'vitest';

import {
  GuideShotError,
  parseRecipe,
  validateRecipe,
  validateRecipeSemantics,
} from '../src/index.js';
import { config, recipe } from './helpers.js';

describe('recipe validation', () => {
  it('accepts comments and trailing commas only for JSONC', () => {
    const text = `{
      // authoring comment
      "version": 1,
      "id": "demo.capture",
      "page": { "path": "/demo" },
      "accessibility": { "alt": "Demo" },
    }`;
    expect(parseRecipe(text, { file: 'demo.shot.jsonc' }).id).toBe(
      'demo.capture',
    );
    expect(() => parseRecipe(text, { file: 'demo.shot.json' })).toThrowError(
      expect.objectContaining({ code: 'RECIPE_SCHEMA_INVALID' }),
    );
  });

  it('rejects unknown recipe properties', () => {
    expect(() => validateRecipe({ ...recipe(), secret: 'never' })).toThrowError(
      GuideShotError,
    );
  });

  it('rejects unsupported custom actions at the schema boundary', () => {
    expect(() =>
      validateRecipe({
        ...recipe(),
        prepare: [{ do: 'invoke', use: 'demo:reset-clock', with: { hour: 9 } }],
      }),
    ).toThrowError(expect.objectContaining({ code: 'RECIPE_SCHEMA_INVALID' }));
  });

  it('rejects unregistered profiles, dimensions, and scenarios', () => {
    expect(() =>
      validateRecipeSemantics(
        { file: '/recipe.json', recipe: recipe({ profile: 'mobile' }) },
        config(),
      ),
    ).toThrowError(
      expect.objectContaining({ code: 'EXTENSION_NOT_REGISTERED' }),
    );

    expect(() =>
      validateRecipeSemantics(
        {
          file: '/recipe.json',
          recipe: recipe({
            matrix: { dimensions: { locale: ['en'] } },
          }),
        },
        config(),
      ),
    ).toThrowError(
      expect.objectContaining({ code: 'EXTENSION_NOT_REGISTERED' }),
    );

    expect(() =>
      validateRecipeSemantics(
        {
          file: '/recipe.json',
          recipe: recipe({ scenario: { use: 'demo:auth' } }),
        },
        config(),
      ),
    ).toThrowError(
      expect.objectContaining({ code: 'EXTENSION_NOT_REGISTERED' }),
    );
  });

  it('validates scenario input against its registered schema', () => {
    const configured = config({
      scenarios: {
        'demo:auth': {
          name: 'demo:auth',
          version: '1',
          schema: {
            type: 'object',
            properties: { role: { type: 'string' } },
            required: ['role'],
            additionalProperties: false,
          },
          prepare() {
            return Promise.resolve({});
          },
        },
      },
    });
    expect(() =>
      validateRecipeSemantics(
        {
          file: '/recipe.json',
          recipe: recipe({ scenario: { use: 'demo:auth', with: {} } }),
        },
        configured,
      ),
    ).toThrowError(expect.objectContaining({ code: 'RECIPE_SCHEMA_INVALID' }));
  });
});

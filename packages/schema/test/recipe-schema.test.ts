import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'vitest';

import { RecipeSchema, SCHEMA_VERSION } from '../src/index.js';
import {
  decorativeRecipe,
  fullRecipe,
  minimalRecipe,
} from './fixtures/recipes.js';

const isRecipe = (value: unknown): boolean => Value.Check(RecipeSchema, value);

describe('RecipeSchema', () => {
  it('accepts minimal, complete, and decorative recipes', () => {
    expect(SCHEMA_VERSION).toBe(1);
    expect(isRecipe(minimalRecipe)).toBe(true);
    expect(isRecipe(fullRecipe)).toBe(true);
    expect(isRecipe(decorativeRecipe)).toBe(true);
  });

  it('rejects unsupported schema versions and malformed identity', () => {
    expect(isRecipe({ ...minimalRecipe, version: 2 })).toBe(false);
    expect(isRecipe({ ...minimalRecipe, id: 'Contains spaces' })).toBe(false);
    expect(isRecipe({ ...minimalRecipe, page: { path: 'demo/sign-in' } })).toBe(
      false,
    );
  });

  it('rejects unknown properties at every fixed schema boundary', () => {
    expect(isRecipe({ ...minimalRecipe, private: true })).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        page: { ...minimalRecipe.page, origin: 'https://example.com' },
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        prepare: [{ do: 'click', target: 'auth.submit', force: true }],
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        ready: [{ expect: 'visible', target: 'auth.card', retries: 3 }],
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        annotations: [
          {
            id: 'email',
            kind: 'outline',
            target: 'auth.email',
            color: 'red',
          },
        ],
      }),
    ).toBe(false);
  });

  it('validates matrix dimensions and include/exclude rules', () => {
    expect(
      isRecipe({
        ...minimalRecipe,
        matrix: {
          dimensions: { locale: ['en', 'da'], theme: ['light', 'dark'] },
          include: [{ locale: 'en', experimental: true }],
          exclude: [{ locale: 'da', theme: 'dark' }],
        },
      }),
    ).toBe(true);

    expect(
      isRecipe({
        ...minimalRecipe,
        matrix: { dimensions: { locale: [] } },
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        matrix: {
          dimensions: { locale: ['en'] },
          include: [{ locale: { language: 'en' } }],
        },
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        matrix: { dimensions: { locale: ['en'] }, where: [] },
      }),
    ).toBe(false);
  });

  it('enforces discriminated action and expectation payloads', () => {
    expect(
      isRecipe({
        ...minimalRecipe,
        prepare: [{ do: 'fill', target: 'auth.email' }],
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        prepare: [{ do: 'evaluate', script: 'alert(1)' }],
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        prepare: [
          { do: 'invoke', use: 'pilot:reset-clock', with: { hour: 9 } },
        ],
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        ready: [{ expect: 'count', target: 'row', count: -1 }],
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        ready: [{ expect: 'route', path: 'demo/recipes' }],
      }),
    ).toBe(false);
  });

  it('rejects impossible frames and malformed annotation placement', () => {
    expect(
      isRecipe({
        ...minimalRecipe,
        capture: { frame: { around: [] } },
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        capture: {
          frame: { region: { x: 0, y: 0, width: 0, height: 100 } },
        },
      }),
    ).toBe(false);
    expect(
      isRecipe({
        ...minimalRecipe,
        annotations: [
          {
            id: 'email',
            kind: 'callout',
            target: 'auth.email',
            content: 'Enter your email.',
            placement: { side: 'diagonal' },
          },
        ],
      }),
    ).toBe(false);
  });

  it('requires exactly one accessibility mode', () => {
    expect(isRecipe({ ...minimalRecipe, accessibility: { alt: '' } })).toBe(
      false,
    );
    expect(
      isRecipe({
        ...minimalRecipe,
        accessibility: { alt: 'Description', decorative: true },
      }),
    ).toBe(false);
    expect(isRecipe({ ...minimalRecipe, accessibility: {} })).toBe(false);
  });

  it('publishes one canonical format per recipe variant', () => {
    expect(
      isRecipe({
        ...minimalRecipe,
        output: { formats: ['png', 'webp'] },
      }),
    ).toBe(false);
  });
});

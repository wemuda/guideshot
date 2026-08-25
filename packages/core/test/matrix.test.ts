import { describe, expect, it } from 'vitest';

import {
  GuideShotError,
  createVariantKey,
  expandMatrix,
} from '../src/index.js';

describe('matrix expansion', () => {
  it('sorts dimensions while preserving declared value order', () => {
    expect(
      expandMatrix({
        dimensions: {
          theme: ['light', 'dark'],
          locale: ['en', 'da'],
        },
      }),
    ).toEqual([
      {
        key: 'locale=en;theme=light',
        values: { locale: 'en', theme: 'light' },
      },
      {
        key: 'locale=en;theme=dark',
        values: { locale: 'en', theme: 'dark' },
      },
      {
        key: 'locale=da;theme=light',
        values: { locale: 'da', theme: 'light' },
      },
      {
        key: 'locale=da;theme=dark',
        values: { locale: 'da', theme: 'dark' },
      },
    ]);
  });

  it('applies partial exclusions and explicit complete inclusions', () => {
    expect(
      expandMatrix({
        dimensions: { locale: ['en', 'da'], theme: ['light', 'dark'] },
        exclude: [{ locale: 'da' }],
        include: [{ locale: 'da', theme: 'dark' }],
      }).map((row) => row.key),
    ).toEqual([
      'locale=en;theme=light',
      'locale=en;theme=dark',
      'locale=da;theme=dark',
    ]);
  });

  it('returns one default row without a matrix', () => {
    expect(expandMatrix()).toEqual([{ key: 'default', values: {} }]);
  });

  it('rejects incomplete includes and stringified key collisions', () => {
    expect(() =>
      expandMatrix({
        dimensions: { locale: ['en'], theme: ['light'] },
        include: [{ locale: 'en' }],
      }),
    ).toThrowError(GuideShotError);

    expect(() =>
      expandMatrix({ dimensions: { density: [1, '1'] } }),
    ).toThrowError(expect.objectContaining({ code: 'OUTPUT_COLLISION' }));
  });

  it('escapes dimension names and values in keys', () => {
    expect(createVariantKey({ brand: 'Guide Shot', locale: 'en-US' })).toBe(
      'brand=Guide%20Shot;locale=en-US',
    );
  });
});

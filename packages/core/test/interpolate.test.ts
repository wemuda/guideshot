import { describe, expect, it } from 'vitest';

import {
  GuideShotError,
  interpolate,
  interpolateString,
} from '../src/index.js';

const context = {
  scenario: {
    recipeId: 42,
    user: { name: 'Ada' },
  },
  variant: { locale: 'da', dark: true },
} as const;

describe('restricted interpolation', () => {
  it('preserves the type of a full reference', () => {
    expect(interpolateString('${scenario.recipeId}', context)).toBe(42);
  });

  it('interpolates primitives through nested JSON', () => {
    expect(
      interpolate(
        {
          path: '/recipes/${scenario.recipeId}',
          title: '${scenario.user.name} (${variant.locale})',
          enabled: '${variant.dark}',
        },
        context,
      ),
    ).toEqual({
      path: '/recipes/42',
      title: 'Ada (da)',
      enabled: true,
    });
  });

  it.each(['${env.SECRET}', '${scenario.missing}', '${scenario.__proto__}'])(
    'rejects unresolved or unsafe reference %s',
    (reference) => {
      expect(() => interpolateString(reference, context)).toThrowError(
        expect.objectContaining({ code: 'VARIABLE_UNRESOLVED' }),
      );
    },
  );

  it('rejects embedding objects into strings', () => {
    expect(() =>
      interpolateString('User: ${scenario.user}', context),
    ).toThrowError(GuideShotError);
  });
});

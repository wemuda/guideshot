import { describe, expect, it } from 'vitest';

import {
  resolveRecipeText,
  resolvedAnnotations,
  type Recipe,
} from '../src/index.js';

describe('annotation text resolution', () => {
  it('resolves callout, label, and marker content', async () => {
    const recipe = {
      version: 1,
      id: 'annotation.text',
      page: { path: '/demo' },
      annotations: [
        {
          id: 'callout',
          kind: 'callout',
          target: 'demo.action',
          content: { en: 'Open', da: 'Åbn' },
        },
        {
          id: 'label',
          kind: 'label',
          target: 'demo.action',
          content: { en: 'Action', da: 'Handling' },
        },
        {
          id: 'marker',
          kind: 'marker',
          target: 'demo.action',
          content: { en: '1', da: 'Én' },
        },
        {
          id: 'marker-default',
          kind: 'marker',
          target: 'demo.action',
        },
      ],
      accessibility: { alt: { en: 'Example', da: 'Eksempel' } },
    } satisfies Recipe;

    const resolved = await resolveRecipeText(recipe, undefined, {
      locale: 'da',
      variables: {},
      variants: {},
    });

    expect(
      resolved.annotations?.map((annotation) =>
        'content' in annotation ? annotation.content : undefined,
      ),
    ).toEqual(['Åbn', 'Handling', 'Én', undefined]);
    expect(
      resolvedAnnotations(resolved).map((annotation) => annotation.text),
    ).toEqual(['Åbn', 'Handling', 'Én', undefined]);
  });
});

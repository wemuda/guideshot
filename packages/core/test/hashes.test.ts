import { describe, expect, it } from 'vitest';

import {
  canonicalSerialize,
  createJobCompositionHash,
  planRecipes,
} from '../src/index.js';
import { config, recipe } from './helpers.js';

describe('deterministic identities', () => {
  it('canonicalizes object keys without changing array order', () => {
    expect(canonicalSerialize({ z: [2, 1], a: { d: true, c: null } })).toBe(
      '{"a":{"c":null,"d":true},"z":[2,1]}',
    );
  });

  it('keeps annotation changes out of the capture identity', () => {
    const first = recipe({
      annotations: [
        {
          id: 'name',
          kind: 'callout',
          target: 'recipe.name',
          content: 'First copy',
        },
      ],
    });
    const second = recipe({
      annotations: [
        {
          id: 'name',
          kind: 'callout',
          target: 'recipe.name',
          content: 'Changed copy',
        },
      ],
    });
    const firstJob = planRecipes(config(), [
      { file: '/first.json', recipe: first },
    ]).jobs[0];
    const secondJob = planRecipes(config(), [
      { file: '/second.json', recipe: second },
    ]).jobs[0];

    expect(firstJob?.captureKey).toBe(secondJob?.captureKey);
    expect(createJobCompositionHash(firstJob!, 'scene-hash')).not.toBe(
      createJobCompositionHash(secondJob!, 'scene-hash'),
    );
  });

  it('changes the capture identity when browser intent changes', () => {
    const first = planRecipes(config(), [
      { file: '/first.json', recipe: recipe() },
    ]).jobs[0];
    const second = planRecipes(config(), [
      {
        file: '/second.json',
        recipe: recipe({ prepare: [{ do: 'click', target: 'menu.open' }] }),
      },
    ]).jobs[0];
    expect(first?.captureKey).not.toBe(second?.captureKey);
  });
});

import { describe, expect, it } from 'vitest';

import { planRecipes } from '../src/index.js';
import { config, recipe } from './helpers.js';

describe('planning URL preflight', () => {
  it.each([
    'file:///tmp/guideshot',
    'https://user:secret@example.test',
    'https://example.test',
  ])('rejects unsafe configured server URL %s', (serverUrl) => {
    const configured = config({ server: { url: serverUrl } });

    expect(() =>
      planRecipes(configured, [
        { file: '/fixture.shot.json', recipe: recipe() },
      ]),
    ).toThrowError(expect.objectContaining({ code: 'ORIGIN_NOT_ALLOWED' }));
  });

  it.each([
    'https://outside.example.test/shot',
    '//outside.example.test/shot',
    '//user:secret@docs.example.test/shot',
  ])('rejects an escaping or credentialed recipe page %s', (pagePath) => {
    const serverUrl = 'https://docs.example.test';
    const configured = config({
      server: { url: serverUrl },
      safety: { allowedOrigins: [serverUrl] },
    });

    expect(() =>
      planRecipes(configured, [
        {
          file: '/fixture.shot.json',
          recipe: recipe({ page: { path: pagePath } }),
        },
      ]),
    ).toThrowError(expect.objectContaining({ code: 'ORIGIN_NOT_ALLOWED' }));
  });

  it('accepts allowlisted origins with same-origin page paths', () => {
    const serverUrl = 'https://docs.example.test';
    const configured = config({
      server: { url: serverUrl },
      safety: { allowedOrigins: [serverUrl] },
    });

    expect(
      planRecipes(configured, [
        {
          file: '/fixture.shot.json',
          recipe: recipe({ page: { path: '/guides/getting-started' } }),
        },
      ]).jobs,
    ).toHaveLength(1);
  });
});

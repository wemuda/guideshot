import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'vitest';

import { PublicManifestSchema } from '../src/index.js';
import { publicManifest } from './fixtures/manifest.js';

const isManifest = (value: unknown): boolean =>
  Value.Check(PublicManifestSchema, value);

describe('PublicManifestSchema', () => {
  it('accepts a public manifest with PNG and WebP variants', () => {
    expect(isManifest(publicManifest)).toBe(true);
    expect(isManifest({ version: 1, entries: [] })).toBe(true);
  });

  it('rejects private or unknown fields', () => {
    expect(
      isManifest({ ...publicManifest, generatedFrom: '/private/project' }),
    ).toBe(false);
    expect(
      isManifest({
        ...publicManifest,
        entries: [
          {
            ...publicManifest.entries[0],
            scenario: { token: 'secret' },
          },
        ],
      }),
    ).toBe(false);
    expect(
      isManifest({
        version: 1,
        entries: [
          {
            id: 'pilot.sign-in',
            variants: {
              'locale=en': {
                src: './asset.webp',
                width: 100,
                height: 100,
                format: 'webp',
                hash: 'abcd',
                alt: 'Sign-in form.',
                localPath: '/private/asset.webp',
              },
            },
          },
        ],
      }),
    ).toBe(false);
  });

  it('rejects malformed variants', () => {
    expect(
      isManifest({
        version: 1,
        entries: [
          {
            id: 'pilot.sign-in',
            variants: {},
          },
        ],
      }),
    ).toBe(false);
    expect(
      isManifest({
        version: 1,
        entries: [
          {
            id: 'pilot.sign-in',
            variants: {
              'locale=en': {
                src: './asset.jpg',
                width: 0,
                height: 100,
                format: 'jpeg',
                hash: '',
                alt: 'Sign-in form.',
              },
            },
          },
        ],
      }),
    ).toBe(false);
  });
});

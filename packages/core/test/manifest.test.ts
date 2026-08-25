import { describe, expect, it } from 'vitest';

import { buildPublicManifest, createAssetPath } from '../src/index.js';

const hash = 'a'.repeat(64);

describe('public manifests', () => {
  it('orders entries and variants and drops private input fields', () => {
    const privateAsset = {
      recipeId: 'account.home',
      title: 'Account',
      variantKey: 'locale=en;theme=dark',
      src: './assets/account.webp',
      width: 1280,
      height: 800,
      format: 'webp' as const,
      hash,
      alt: 'Account overview',
      scenario: { cookie: 'secret' },
      absolutePath: '/private/output.webp',
    };
    const manifest = buildPublicManifest([
      privateAsset,
      {
        ...privateAsset,
        recipeId: 'account.home',
        variantKey: 'locale=da;theme=dark',
        src: './assets/account-da.webp',
        alt: 'Kontooversigt',
      },
    ]);
    expect(Object.keys(manifest.entries[0]!.variants)).toEqual([
      'locale=da;theme=dark',
      'locale=en;theme=dark',
    ]);
    expect(JSON.stringify(manifest)).not.toContain('secret');
    expect(JSON.stringify(manifest)).not.toContain('/private');
  });

  it('rejects duplicate identities and unsafe sources', () => {
    const asset = {
      recipeId: 'demo.capture',
      variantKey: 'default',
      src: './assets/demo.png',
      width: 1,
      height: 1,
      format: 'png' as const,
      hash,
      alt: '',
    };
    expect(() => buildPublicManifest([asset, asset])).toThrowError(
      expect.objectContaining({ code: 'OUTPUT_COLLISION' }),
    );
    expect(() =>
      buildPublicManifest([{ ...asset, src: '../private/demo.png' }]),
    ).toThrowError(expect.objectContaining({ code: 'MANIFEST_INVALID' }));
  });

  it('creates content-addressed public asset paths', () => {
    expect(
      createAssetPath('demo.capture', 'locale=en;theme=dark', hash, 'webp'),
    ).toBe('./assets/demo.capture.locale-en-theme-dark.aaaaaaaaaaaa.webp');
  });
});

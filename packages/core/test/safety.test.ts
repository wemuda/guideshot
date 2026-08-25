import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  assertAllowedOrigin,
  resolveArtifactPath,
  resolvePageUrl,
  resolveSafeProjectPaths,
} from '../src/index.js';

describe('origin and output safety', () => {
  it('allows loopback and requires explicit external origins', () => {
    expect(assertAllowedOrigin('http://127.0.0.1:3000').origin).toBe(
      'http://127.0.0.1:3000',
    );
    expect(() => assertAllowedOrigin('https://example.com')).toThrowError(
      expect.objectContaining({ code: 'ORIGIN_NOT_ALLOWED' }),
    );
    expect(
      assertAllowedOrigin('https://example.com/docs', ['https://example.com'])
        .origin,
    ).toBe('https://example.com');
  });

  it('prevents navigation and artifact traversal', () => {
    expect(() =>
      resolvePageUrl('http://localhost:3000', '//example.com/private'),
    ).toThrowError(expect.objectContaining({ code: 'ORIGIN_NOT_ALLOWED' }));
    expect(() =>
      resolveArtifactPath('/project/output', '../private'),
    ).toThrowError(expect.objectContaining({ code: 'OUTPUT_COLLISION' }));
  });

  it('requires disjoint descendant cache and output directories', () => {
    expect(resolveSafeProjectPaths('/project', 'generated', '.cache')).toEqual({
      outputDir: path.resolve('/project/generated'),
      cacheDir: path.resolve('/project/.cache'),
    });
    expect(() =>
      resolveSafeProjectPaths('/project', 'generated', 'generated/cache'),
    ).toThrowError(expect.objectContaining({ code: 'OUTPUT_COLLISION' }));
  });
});

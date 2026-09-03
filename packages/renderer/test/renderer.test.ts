import { describe, expect, it } from 'vitest';
import packageJson from '../package.json' with { type: 'json' };

import { htmlRenderer } from '../src/renderer.js';

describe('htmlRenderer', () => {
  it('uses the package version for composition cache identity', () => {
    expect(htmlRenderer()).toMatchObject({
      name: 'guideshot:html',
      version: packageJson.version,
      apiVersion: 1,
    });
  });
});

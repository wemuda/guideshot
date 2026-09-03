import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import type { CapturedScene, CompositionRequest } from '../src/contracts.js';

const browserDescribe =
  process.env.GUIDESHOT_RENDERER_BROWSER_TESTS === '1'
    ? describe
    : describe.skip;

browserDescribe('Chromium renderer', () => {
  it('emits PNG and WebP at the exact requested size without network access', async () => {
    const background = Uint8Array.from(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    );
    const scene: CapturedScene = {
      version: 1,
      captureKey: 'capture',
      recipeId: 'format-test',
      variantKey: 'default',
      variants: {},
      frame: { x: 0, y: 0, width: 1, height: 1 },
      viewport: { width: 1, height: 1, pixelRatio: 1, scrollX: 0, scrollY: 0 },
      targets: {},
      locale: 'en',
      direction: 'ltr',
      safeVariables: {},
      background: {
        file: 'scene.png',
        width: 1,
        height: 1,
        format: 'png',
        sha256: createHash('sha256').update(background).digest('hex'),
      },
      environment: {
        driver: 'fixture',
        driverVersion: '1',
        browser: 'fixture',
        browserVersion: '1',
      },
      sanitized: true,
    };
    const request: CompositionRequest = {
      scene,
      background,
      annotations: [],
      output: { formats: ['webp', 'png'], width: 8, height: 8, quality: 90 },
    };
    const { htmlRenderer } = await import('../src/renderer.js');
    const run = await htmlRenderer().open();

    try {
      const assets = await run.render(request);
      expect(assets.map(({ format }) => format)).toEqual(['png', 'webp']);
      expect(
        assets.every(({ width, height }) => width === 8 && height === 8),
      ).toBe(true);
      expect([...assets[0]!.bytes.slice(0, 4)]).toEqual([137, 80, 78, 71]);
      expect(Buffer.from(assets[1]!.bytes.slice(0, 4)).toString('ascii')).toBe(
        'RIFF',
      );
      const repeated = await run.render(request);
      expect(repeated.map(({ bytes }) => bytes)).toEqual(
        assets.map(({ bytes }) => bytes),
      );
      const concurrent = await Promise.all([
        run.render(request),
        run.render(request),
      ]);
      expect(
        concurrent.every((result) =>
          result.every(({ bytes }, index) =>
            Buffer.from(bytes).equals(Buffer.from(assets[index]!.bytes)),
          ),
        ),
      ).toBe(true);
    } finally {
      await run.close();
    }
  });
});

import { createHash } from 'node:crypto';

import { GuideShotError } from '@guideshot/core';
import { describe, expect, it } from 'vitest';

import type { CapturedScene } from '../src/contracts.js';
import {
  createCompositionHtml,
  escapeHtml,
  layoutAnnotations,
  mimeTypeFor,
  normalizeFormats,
  resolveOutputSize,
} from '../src/document.js';
import type { NormalizedAnnotation } from '../src/annotations.js';
import { resolveTheme } from '../src/theme.js';

const scene: CapturedScene = {
  version: 1,
  captureKey: 'capture-key',
  recipeId: 'demo.recipe',
  variantKey: 'locale=en;theme=light',
  variants: { locale: 'en', theme: 'light' },
  frame: { x: 40, y: 20, width: 500, height: 320 },
  viewport: { width: 800, height: 600, pixelRatio: 2, scrollX: 0, scrollY: 0 },
  targets: {
    button: {
      rect: { x: 180, y: 130, width: 100, height: 40 },
      visible: true,
      borderRadius: 8,
    },
  },
  locale: 'en',
  direction: 'ltr',
  theme: 'light',
  safeVariables: {},
  background: {
    file: 'scene.png',
    width: 1000,
    height: 640,
    format: 'png',
    sha256: '0'.repeat(64),
  },
  environment: {
    driver: 'playwright',
    driverVersion: '1',
    browser: 'chromium',
    browserVersion: '1',
  },
  sanitized: true,
};

const callout: NormalizedAnnotation = {
  id: 'callout',
  kind: 'callout',
  target: 'button',
  padding: 6,
  text: 'Click <Create> & continue',
  placement: { side: 'auto', offset: 16, nudge: { x: 0, y: 0 } },
  connector: true,
  connectorAnchor: 'edge',
  emphasis: 'spotlight',
};

describe('composition document', () => {
  it('escapes every HTML-sensitive plain-text character', () => {
    expect(escapeHtml(`<script data-x="'">&</script>`)).toBe(
      '&lt;script data-x=&quot;&#39;&quot;&gt;&amp;&lt;/script&gt;',
    );
  });

  it('emits hash-stable HTML independent of input annotation order', () => {
    const label: NormalizedAnnotation = {
      id: 'a-label',
      kind: 'label',
      target: 'button',
      padding: 4,
      text: 'Safe label',
      placement: { side: 'top', offset: 12, nudge: { x: 0, y: 0 } },
    };
    const annotations = [callout, label];
    const measurements = new Map([
      ['callout', { width: 190, height: 48 }],
      ['a-label', { width: 90, height: 30 }],
    ]);
    const makeHtml = (ordered: readonly NormalizedAnnotation[]) => {
      const layout = layoutAnnotations({
        scene,
        annotations: ordered,
        measurements,
      });
      return createCompositionHtml({
        scene,
        background: Uint8Array.of(1, 2, 3, 4),
        annotations: ordered,
        measurements,
        layout,
        outputSize: { width: 1000, height: 640 },
        theme: resolveTheme('light', undefined),
        font: Uint8Array.of(5, 6, 7),
      });
    };

    const forward = makeHtml(annotations);
    const reverse = makeHtml([...annotations].reverse());

    expect(createHash('sha256').update(forward).digest('hex')).toBe(
      createHash('sha256').update(reverse).digest('hex'),
    );
    expect(forward).toContain('Click &lt;Create&gt; &amp; continue');
    expect(forward).not.toContain('Click <Create>');
  });

  it('renders every supported primitive in deterministic layers', () => {
    const annotations: readonly NormalizedAnnotation[] = [
      callout,
      {
        id: 'arrow',
        kind: 'arrow',
        target: 'button',
        padding: 0,
        placement: { side: 'bottom', offset: 4, nudge: { x: 0, y: 0 } },
      },
      { id: 'spotlight', kind: 'spotlight', target: 'button', padding: 5 },
      { id: 'outline', kind: 'outline', target: 'button', padding: 5 },
      {
        id: 'marker',
        kind: 'marker',
        target: 'button',
        padding: 0,
        text: '1',
        placement: { side: 'left', offset: 8, nudge: { x: 0, y: 0 } },
      },
      {
        id: 'label',
        kind: 'label',
        target: 'button',
        padding: 0,
        text: 'Name',
        placement: { side: 'top', offset: 8, nudge: { x: 0, y: 0 } },
      },
      { id: 'redaction', kind: 'redaction', target: 'button', padding: 2 },
    ];
    const measurements = new Map([
      ['callout', { width: 140, height: 44 }],
      ['marker', { width: 30, height: 30 }],
      ['label', { width: 60, height: 28 }],
    ]);
    const layout = layoutAnnotations({ scene, annotations, measurements });
    const html = createCompositionHtml({
      scene,
      background: Uint8Array.of(1),
      annotations,
      measurements,
      layout,
      outputSize: { width: 500, height: 320 },
      theme: resolveTheme('dark', undefined),
      font: Uint8Array.of(2),
    });

    expect(html).toContain('guideshot-spotlight-mask');
    expect(html).toContain('data-kind="outline"');
    expect(html).toContain('data-kind="redaction"');
    expect(html).toContain('class="box marker"');
    expect(html).toContain('class="box label"');
    expect(html.match(/marker-end=/g)).toHaveLength(2);
    expect(html).toContain('markerUnits="userSpaceOnUse"');
    expect(html).toContain('d="M1,1 L7,4 L1,7"');
    expect(html).not.toContain('markerUnits="strokeWidth"');
    expect(html).toContain(
      'x="174" y="124" width="112" height="52" rx="14" fill="black"',
    );
    expect(html).toContain(
      'data-kind="outline" x="175" y="125" width="110" height="50" rx="13" fill="none" stroke="#6f91ff" stroke-width="2"',
    );
    expect(html).toContain('stroke-width="2" stroke-linecap="round"');
    expect(html).toContain(
      '.callout{max-width:280px;padding:10px 14px;border-radius:10px',
    );
    expect(html).toContain('width:28px!important;height:28px!important');
  });

  it('terminates edge connectors at the emphasized boundary', () => {
    const layout = layoutAnnotations({
      scene,
      annotations: [callout],
      measurements: new Map([['callout', { width: 140, height: 44 }]]),
    });

    expect(layout.arrows).toEqual([
      {
        id: 'callout',
        start: { x: 296, y: 150 },
        end: { x: 286, y: 150 },
      },
    ]);
  });

  it('clamps pill highlight corners to the padded target shape', () => {
    const pillScene: CapturedScene = {
      ...scene,
      targets: {
        button: { ...scene.targets.button!, borderRadius: 999 },
      },
    };
    const spotlight: NormalizedAnnotation = {
      id: 'pill',
      kind: 'spotlight',
      target: 'button',
      padding: 5,
    };
    const layout = layoutAnnotations({
      scene: pillScene,
      annotations: [spotlight],
      measurements: new Map(),
    });
    const html = createCompositionHtml({
      scene: pillScene,
      background: Uint8Array.of(1),
      annotations: [spotlight],
      measurements: new Map(),
      layout,
      outputSize: { width: 500, height: 320 },
      theme: resolveTheme('light', undefined),
      font: Uint8Array.of(2),
    });

    expect(html).toContain(
      'x="175" y="125" width="110" height="50" rx="25" fill="black"',
    );
  });

  it.each([
    {
      name: 'missing',
      code: 'TARGET_NOT_FOUND',
      targets: {},
    },
    {
      name: 'hidden',
      code: 'TARGET_NOT_VISIBLE',
      targets: {
        button: { ...scene.targets.button!, visible: false },
      },
    },
  ] as const)(
    'reports a $name annotation target with a stable diagnostic',
    ({ code, targets }) => {
      let error: unknown;
      try {
        layoutAnnotations({
          scene: { ...scene, targets },
          annotations: [callout],
          measurements: new Map([['callout', { width: 140, height: 44 }]]),
        });
      } catch (cause) {
        error = cause;
      }

      expect(error).toBeInstanceOf(GuideShotError);
      expect(error).toMatchObject({
        code,
        recipeId: scene.recipeId,
        jobKey: `${scene.recipeId}::${scene.variantKey}`,
        details: { annotationId: callout.id, target: callout.target },
      });
    },
  );

  it('resolves requested sizes and canonicalizes formats', () => {
    expect(resolveOutputSize(scene, { formats: ['png'] })).toEqual({
      width: 1000,
      height: 640,
    });
    expect(resolveOutputSize(scene, { formats: ['png'], width: 250 })).toEqual({
      width: 250,
      height: 160,
    });
    expect(resolveOutputSize(scene, { formats: ['png'], height: 160 })).toEqual(
      {
        width: 250,
        height: 160,
      },
    );
    expect(
      resolveOutputSize(scene, { formats: ['png'], width: 300, height: 192 }),
    ).toEqual({
      width: 300,
      height: 192,
    });
    expect(() =>
      resolveOutputSize(scene, { formats: ['png'], width: 300, height: 200 }),
    ).toThrow('do not preserve the captured frame aspect ratio');
    expect(normalizeFormats(['webp', 'png', 'webp'])).toEqual(['png', 'webp']);
    expect(mimeTypeFor('png')).toBe('image/png');
    expect(mimeTypeFor('webp')).toBe('image/webp');
  });

  it.each([
    ['16:9', 1600, 900, 1920, 1080],
    ['4:3', 1200, 900, 1600, 1200],
    ['9:16', 900, 1600, 1080, 1920],
  ] as const)(
    'preserves a %s frame when deriving output dimensions',
    (_name, frameWidth, frameHeight, width, height) => {
      expect(
        resolveOutputSize(
          {
            ...scene,
            frame: { ...scene.frame, width: frameWidth, height: frameHeight },
          },
          { formats: ['webp'], width },
        ),
      ).toEqual({ width, height });
    },
  );
});

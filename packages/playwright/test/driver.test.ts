import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import { createServer, type Server } from 'node:http';

import type { CaptureRequest, ResolvedCaptureJob } from '@guideshot/core';
import { chromium } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import packageJson from '../package.json' with { type: 'json' };

import { playwrightDriver } from '../src/index.js';

const browserAvailable = existsSync(chromium.executablePath());

describe.runIf(browserAvailable)('playwrightDriver', () => {
  let fixture: Server;
  let baseUrl: URL;
  let documentRequests = 0;

  beforeAll(async () => {
    fixture = createServer((request, response) => {
      documentRequests += 1;
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(
        fixtureHtml(request.url ?? '/', request.headers['x-fixture']),
      );
    });
    await new Promise<void>((resolve) =>
      fixture.listen(0, '127.0.0.1', resolve),
    );
    const address = fixture.address();
    if (address === null || typeof address === 'string') {
      throw new Error('Fixture server did not expose a TCP address.');
    }
    baseUrl = new URL(`http://127.0.0.1:${address.port}`);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      fixture.close((error) =>
        error === undefined ? resolve() : reject(error),
      ),
    );
  });

  it('applies browser state, executes actions and expectations, frames targets, and masks privacy pixels', async () => {
    const driver = playwrightDriver({
      timeoutMs: 3_000,
      navigationTimeoutMs: 5_000,
      stabilityIntervalMs: 20,
    });
    expect(driver).toMatchObject({
      name: '@guideshot/playwright',
      version: packageJson.version,
    });
    expect(await driver.describeEnvironment()).toMatchObject({
      driver: '@guideshot/playwright',
      driverVersion: packageJson.version,
      browser: 'chromium',
    });
    const run = await driver.open({
      baseUrl,
      targetAttribute: 'data-guide-target',
    });

    try {
      const result = await run.capture(
        captureRequest({
          page: { path: '/' },
          browser: {
            locale: 'da-DK',
            colorScheme: 'dark',
            reducedMotion: 'reduce',
            timezoneId: 'Europe/Copenhagen',
            extraHTTPHeaders: { 'x-fixture': 'header-ready' },
            cookies: [
              {
                name: 'fixture',
                value: 'cookie-ready',
                url: baseUrl.href,
              },
            ],
            localStorage: [
              {
                origin: baseUrl.origin,
                values: { fixture: 'storage-ready' },
              },
            ],
          },
          prepare: [
            { do: 'fill', target: 'form.name', value: 'Ada' },
            { do: 'select', target: 'form.locale', value: 'da' },
            { do: 'check', target: 'form.enabled' },
            { do: 'click', target: 'form.submit' },
          ],
          ready: [
            { expect: 'visible', target: 'panel' },
            { expect: 'hidden', target: 'app.loading' },
            { expect: 'value', target: 'form.name', value: 'Ada' },
            { expect: 'checked', target: 'form.enabled' },
            {
              expect: 'text',
              target: 'result',
              value:
                'Ada|storage-ready|cookie-ready|da-DK|dark|reduce|header-ready',
            },
            {
              expect: 'attribute',
              target: 'result',
              name: 'data-state',
              value: 'ready',
            },
            { expect: 'count', target: 'list.item', count: 2 },
            { expect: 'route', path: '/' },
          ],
          capture: {
            frame: { target: 'panel', padding: 10 },
            pixelRatio: 2,
            stability: 'documentation',
          },
        }),
      );

      expect(result.scene.sanitized).toBe(true);
      expect(result.scene.locale).toBe('da-DK');
      expect(result.scene.theme).toBe('dark');
      expect(result.scene.frame).toEqual({
        x: 30,
        y: 30,
        width: 420,
        height: 280,
      });
      expect(result.scene.background).toMatchObject({
        width: 840,
        height: 560,
        format: 'png',
      });
      expect(result.scene.background.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect([...result.background.slice(0, 4)]).toEqual([
        0x89, 0x50, 0x4e, 0x47,
      ]);
      expect(result.scene.targets['form.name']?.rect.x).toBeGreaterThan(0);

      const privateTarget = result.scene.targets['privacy.secret'];
      expect(privateTarget).toBeDefined();
      const pixel = await pngPixel(
        result.background,
        Math.floor(((privateTarget?.rect.x ?? 0) + 4) * 2),
        Math.floor(((privateTarget?.rect.y ?? 0) + 4) * 2),
      );
      expect(pixel).toEqual([0, 0, 0, 255]);
    } finally {
      await run.close();
    }
  }, 20_000);

  it('captures compatible recipes from one isolated prepared page', async () => {
    documentRequests = 0;
    const run = await playwrightDriver({
      timeoutMs: 3_000,
      navigationTimeoutMs: 5_000,
      stabilityIntervalMs: 20,
    }).open({
      baseUrl,
      targetAttribute: 'data-guide-target',
    });
    const first = {
      ...captureRequest({
        key: 'first.default',
        recipeId: 'first',
        ready: [{ expect: 'count', target: 'list.item', count: 2 }],
        capture: { frame: { target: 'panel', padding: 10 } },
      }),
      captureKey: 'first-key',
    };
    const second = {
      ...captureRequest({
        key: 'second.default',
        recipeId: 'second',
        ready: [{ expect: 'count', target: 'list.item', count: 2 }],
        capture: { frame: { target: 'panel', padding: 10 } },
      }),
      captureKey: 'second-key',
    };

    try {
      const results = await run.captureMany?.([first, second]);

      expect(results).toHaveLength(2);
      expect(documentRequests).toBe(1);
      expect(results?.map(({ scene }) => scene.recipeId)).toEqual([
        'first',
        'second',
      ]);
      expect(results?.[0]?.background).toEqual(results?.[1]?.background);
      expect(results?.[0]?.scene.captureKey).toBe(first.captureKey);
      expect(results?.[1]?.scene.captureKey).toBe(second.captureKey);
    } finally {
      await run.close();
    }
  }, 20_000);

  it.each([
    {
      name: 'missing',
      path: '/',
      job: { prepare: [{ do: 'click', target: 'does.not.exist' }] },
      code: 'TARGET_NOT_FOUND',
    },
    {
      name: 'duplicate',
      path: '/duplicate',
      job: {},
      code: 'TARGET_NOT_UNIQUE',
    },
    {
      name: 'hidden',
      path: '/hidden',
      job: { capture: { frame: { target: 'hidden.target' } } },
      code: 'TARGET_NOT_VISIBLE',
    },
    {
      name: 'unstable',
      path: '/unstable',
      job: { capture: { frame: { target: 'moving.target' } } },
      code: 'LAYOUT_UNSTABLE',
    },
    {
      name: 'external navigation',
      path: '/external',
      job: { prepare: [{ do: 'click', target: 'external.link' }] },
      code: 'ORIGIN_NOT_ALLOWED',
    },
  ] as const)(
    'reports $code for $name targets',
    async ({ path, job, code }) => {
      const driver = playwrightDriver({
        timeoutMs: 500,
        stabilitySamples: 3,
        stabilityIntervalMs: 30,
      });
      const run = await driver.open({
        baseUrl,
        targetAttribute: 'data-guide-target',
      });
      try {
        await expect(
          run.capture(
            captureRequest({
              page: { path },
              ...job,
            }),
          ),
        ).rejects.toMatchObject({ name: 'GuideShotError', code });
      } finally {
        await run.close();
      }
    },
    10_000,
  );
});

function captureRequest(
  overrides: Partial<ResolvedCaptureJob> = {},
): CaptureRequest {
  return {
    captureKey: 'capture-key',
    job: {
      key: 'pilot.default',
      recipeId: 'pilot',
      variantKey: 'default',
      variants: {},
      profile: {
        viewport: { width: 800, height: 600 },
        pixelRatio: 1,
      },
      page: { path: '/' },
      prepare: [],
      ready: [],
      capture: {},
      browser: {},
      safeVariables: {},
      ...overrides,
    },
  };
}

function fixtureHtml(
  path: string,
  header: string | string[] | undefined,
): string {
  if (path === '/duplicate') {
    return '<div data-guide-target="duplicate">One</div><div data-guide-target="duplicate">Two</div>';
  }
  if (path === '/hidden') {
    return '<div hidden data-guide-target="hidden.target">Hidden</div>';
  }
  if (path === '/unstable') {
    return `
      <style>#moving{position:absolute;left:20px;top:20px;width:100px;height:60px;background:#16f}</style>
      <div id="moving" data-guide-target="moving.target"></div>
      <script>setInterval(() => { moving.style.left = (parseFloat(moving.style.left || '20') + 3) + 'px' }, 17)</script>
    `;
  }
  if (path === '/external') {
    return '<button data-guide-target="external.link" onclick="location.href = location.href.replace(\'127.0.0.1\', \'localhost\')">Leave</button>';
  }

  const safeHeader = typeof header === 'string' ? header : '';
  return `<!doctype html>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 900px; background: white; font: 16px sans-serif; }
      #panel { position: absolute; left: 40px; top: 40px; width: 400px; height: 260px; padding: 20px; border: 1px solid black; }
      #secret { width: 80px; height: 30px; background: rgb(255, 0, 0); color: white; }
    </style>
    <main id="panel" data-guide-target="panel">
      <label>Name <input data-guide-target="form.name"></label>
      <select data-guide-target="form.locale"><option value="en">English</option><option value="da">Dansk</option></select>
      <label><input type="checkbox" data-guide-target="form.enabled"> Enabled</label>
      <button data-guide-target="form.submit">Submit</button>
      <p data-guide-target="result" data-state="idle">Waiting</p>
      <span data-guide-target="list.item">One</span><span data-guide-target="list.item">Two</span>
      <div id="secret" data-guide-target="privacy.secret">Secret</div>
      <span hidden data-guide-target="app.loading">Loading</span>
    </main>
    <script>
      const header = ${JSON.stringify(safeHeader)};
      document.querySelector('[data-guide-target="form.submit"]').addEventListener('click', () => {
        const name = document.querySelector('[data-guide-target="form.name"]').value;
        const storage = localStorage.getItem('fixture') || '';
        const cookie = document.cookie.includes('fixture=cookie-ready') ? 'cookie-ready' : '';
        const theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference';
        const result = document.querySelector('[data-guide-target="result"]');
        result.textContent = [name, storage, cookie, navigator.language, theme, motion, header].join('|');
        result.dataset.state = 'ready';
      });
    </script>`;
}

async function pngPixel(
  image: Uint8Array,
  x: number,
  y: number,
): Promise<readonly number[]> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    return await page.evaluate(
      async ({ source, x: pixelX, y: pixelY }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (context === null)
          throw new Error('Canvas 2D context is unavailable.');
        context.drawImage(image, 0, 0);
        return [...context.getImageData(pixelX, pixelY, 1, 1).data];
      },
      {
        source: `data:image/png;base64,${Buffer.from(image).toString('base64')}`,
        x,
        y,
      },
    );
  } finally {
    await browser.close();
  }
}

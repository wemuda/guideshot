import { createHash } from 'node:crypto';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type {
  AnnotationRenderer,
  BrowserDriver,
  CaptureResult,
  CompositionRequest,
  GuideShotConfig,
  Recipe,
  RenderedAsset,
} from '@guideshot/core';

export const PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  ),
);

export const WEBP = Uint8Array.from(
  Buffer.from(
    'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v89WAAAAA==',
    'base64',
  ),
);

export interface FakeState {
  serverProbes: number;
  scenarioPrepares: number;
  dimensionResolves: number;
  driverOpens: number;
  captures: number;
  driverCloses: number;
  rendererOpens: number;
  renders: number;
  rendererCloses: number;
  cleanups: number;
  renderRequests: CompositionRequest[];
  scenarioEnabled: boolean;
  driverEnabled: boolean;
  rendererEnabled: boolean;
  returnUnsanitizedScene: boolean;
}

export interface Fixture {
  readonly root: string;
  readonly recipeFile: string;
  readonly config: GuideShotConfig;
  readonly state: FakeState;
  readonly fetch: typeof globalThis.fetch;
}

export async function createFixture(
  recipe: Recipe = fixtureRecipe(),
): Promise<Fixture> {
  const root = await mkdtemp(path.join(tmpdir(), 'guideshot-cli-'));
  const recipeFile = path.join(root, 'account.shot.json');
  await writeRecipe(recipeFile, recipe);
  const state: FakeState = {
    serverProbes: 0,
    scenarioPrepares: 0,
    dimensionResolves: 0,
    driverOpens: 0,
    captures: 0,
    driverCloses: 0,
    rendererOpens: 0,
    renders: 0,
    rendererCloses: 0,
    cleanups: 0,
    renderRequests: [],
    scenarioEnabled: true,
    driverEnabled: true,
    rendererEnabled: true,
    returnUnsanitizedScene: false,
  };
  const driver = fakeDriver(state);
  const renderer = fakeRenderer(state);
  const config: GuideShotConfig = {
    recipes: ['*.shot.json'],
    outputDir: 'public/guideshot',
    cacheDir: '.guideshot/cache',
    server: { url: 'http://127.0.0.1:4173' },
    profiles: {
      desktop: {
        viewport: { width: 1280, height: 800 },
        pixelRatio: 1,
        locale: 'en',
      },
    },
    dimensions: {
      mode: {
        name: 'test:mode',
        version: '1.0.0',
        values: ['basic', 'pro'],
        resolve() {
          state.dimensionResolves += 1;
          return {};
        },
      },
    },
    scenarios: {
      account: {
        name: 'test:account',
        version: '1.0.0',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: { seed: { type: 'string' } },
        },
        prepare() {
          state.scenarioPrepares += 1;
          if (!state.scenarioEnabled) {
            throw new Error('Scenario must not run.');
          }
          return {
            variables: { account: 'Acme' },
            cleanup: () => {
              state.cleanups += 1;
            },
          };
        },
      },
    },
    driver,
    renderer,
  };
  const fetch: typeof globalThis.fetch = () => {
    state.serverProbes += 1;
    return Promise.resolve(new Response('ready'));
  };
  return { root, recipeFile, config, state, fetch };
}

export function fixtureRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    version: 1,
    id: 'account.balance',
    title: 'Account balance',
    tags: ['docs', 'account'],
    profile: 'desktop',
    scenario: { use: 'account', with: { seed: 'private-seed' } },
    page: { path: '/account' },
    matrix: { dimensions: { mode: ['basic'] } },
    annotations: [
      {
        id: 'balance-note',
        kind: 'callout',
        target: 'balance',
        content: 'Balance for ${scenario.account}',
      },
    ],
    accessibility: { alt: 'Balance for ${scenario.account}' },
    output: { formats: ['webp'] },
    ...overrides,
  };
}

export function writeRecipe(file: string, recipe: Recipe): Promise<void> {
  return writeFile(file, `${JSON.stringify(recipe, null, 2)}\n`, 'utf8');
}

function fakeDriver(state: FakeState): BrowserDriver {
  return {
    name: 'test:driver',
    version: '1.0.0',
    describeEnvironment() {
      return Promise.resolve({
        driver: 'test',
        driverVersion: '1.0.0',
        browser: 'fake',
        browserVersion: '1',
      });
    },
    open() {
      state.driverOpens += 1;
      if (!state.driverEnabled) {
        return Promise.reject(new Error('Driver must not open.'));
      }
      return Promise.resolve({
        capture(request): Promise<CaptureResult> {
          state.captures += 1;
          const scene = {
            version: 1 as const,
            captureKey: request.captureKey,
            recipeId: request.job.recipeId,
            variantKey: request.job.variantKey,
            variants: request.job.variants,
            frame: { x: 10, y: 20, width: 1, height: 1 },
            viewport: {
              width: 1280,
              height: 800,
              pixelRatio: 1,
              scrollX: 0,
              scrollY: 0,
            },
            targets: {
              balance: {
                rect: { x: 0, y: 0, width: 1, height: 1 },
                visible: true,
                undeclaredText: 'private target text',
              },
            },
            locale: request.job.browser.locale ?? 'en',
            direction: 'ltr' as const,
            safeVariables: request.job.safeVariables,
            background: {
              file: 'source-page-private-name.png',
              width: 1,
              height: 1,
              format: 'png' as const,
              sha256: createHash('sha256').update(PNG).digest('hex'),
              sourceUrl: 'https://private.example.test/account',
            },
            environment: {
              driver: 'test',
              driverVersion: '1.0.0',
              browser: 'fake',
              browserVersion: '1',
              executablePath: '/private/browser/path',
            },
            sanitized: true as const,
            rawHtml: '<input value="private DOM snapshot">',
          };
          if (state.returnUnsanitizedScene) {
            return Promise.resolve({
              scene: {
                ...scene,
                sanitized: false,
              } as unknown as CaptureResult['scene'],
              background: PNG,
            });
          }
          return Promise.resolve({ scene, background: PNG });
        },
        close() {
          state.driverCloses += 1;
          return Promise.resolve();
        },
      });
    },
  };
}

function fakeRenderer(state: FakeState): AnnotationRenderer {
  return {
    name: 'test:renderer',
    version: '1.0.0',
    open() {
      state.rendererOpens += 1;
      if (!state.rendererEnabled) {
        return Promise.reject(new Error('Renderer failed intentionally.'));
      }
      return Promise.resolve({
        render(request) {
          state.renders += 1;
          state.renderRequests.push(request);
          if (!state.rendererEnabled) {
            return Promise.reject(new Error('Renderer failed intentionally.'));
          }
          const format = request.output.formats[0] ?? 'webp';
          const bytes = format === 'png' ? PNG : WEBP;
          const asset: RenderedAsset = {
            format,
            mimeType: format === 'png' ? 'image/png' : 'image/webp',
            bytes,
            width: 1,
            height: 1,
          };
          return Promise.resolve([asset]);
        },
        close() {
          state.rendererCloses += 1;
          return Promise.resolve();
        },
      });
    },
  };
}

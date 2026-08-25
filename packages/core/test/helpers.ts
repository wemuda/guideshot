import type {
  AnnotationRenderer,
  BrowserDriver,
  GuideShotConfig,
  Recipe,
} from '../src/index.js';

export const driver: BrowserDriver = {
  name: 'test:driver',
  version: '1.0.0',
  describeEnvironment() {
    return Promise.resolve({
      driver: 'test',
      driverVersion: '1.0.0',
      browser: 'test',
      browserVersion: '1',
    });
  },
  open() {
    return Promise.reject(
      new Error('Driver must not be opened by a compiler test.'),
    );
  },
};

export const renderer: AnnotationRenderer = {
  name: 'test:renderer',
  version: '1.0.0',
  open() {
    return Promise.reject(
      new Error('Renderer must not be opened by a compiler test.'),
    );
  },
};

export function config(
  overrides: Partial<GuideShotConfig> = {},
): GuideShotConfig {
  return {
    recipes: ['**/*.shot.json'],
    outputDir: 'generated/guideshot',
    cacheDir: '.guideshot/cache',
    server: { url: 'http://127.0.0.1:4173' },
    profiles: {
      desktop: { viewport: { width: 1280, height: 800 }, pixelRatio: 2 },
    },
    driver,
    renderer,
    ...overrides,
  };
}

export function recipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    version: 1,
    id: 'demo.capture',
    profile: 'desktop',
    page: { path: '/demo' },
    accessibility: { alt: 'A deterministic demo.' },
    output: { formats: ['png'] },
    ...overrides,
  };
}

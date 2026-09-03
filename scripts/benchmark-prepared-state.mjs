import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [
  packageRoot,
  mode = 'batch',
  countInput = '64',
  concurrencyInput = '8',
  iterationsInput = '5',
] = process.argv.slice(2);
if (packageRoot === undefined || (mode !== 'batch' && mode !== 'pool')) {
  throw new TypeError(
    'Usage: node scripts/benchmark-prepared-state.mjs <package-root> <batch|pool> [count] [concurrency] [iterations]',
  );
}

const count = positiveInteger(countInput, 'count');
const concurrency = positiveInteger(concurrencyInput, 'concurrency');
const iterations = positiveInteger(iterationsInput, 'iterations');
const driverModule = pathToFileURL(
  path.resolve(packageRoot, 'packages/playwright/dist/index.js'),
).href;
const { playwrightDriver } = await import(driverModule);
const run = await playwrightDriver().open({
  baseUrl: new URL('http://localhost:3100'),
  targetAttribute: 'data-guide-target',
});
const requests = Array.from({ length: count }, (_, index) => ({
  captureKey: `benchmark-${index}`,
  job: {
    key: `benchmark.${index}`,
    recipeId: `benchmark.${index}`,
    variantKey: 'default',
    variants: {},
    profile: {
      viewport: { width: 1280, height: 960 },
      pixelRatio: 2,
      timezoneId: 'Europe/Copenhagen',
      reducedMotion: 'reduce',
    },
    page: { path: '/demo/showcase?scene=annotations' },
    prepare: [],
    ready: [{ expect: 'visible', target: 'app.ready' }],
    capture: {
      frame: {
        around: ['showcase.canvas'],
        padding: 12,
        aspectRatio: '4:3',
        fit: 'expand',
      },
      stability: 'documentation',
    },
    browser: {},
    safeVariables: {},
  },
}));

try {
  await capture(mode, run, requests, concurrency);
  const samples = [];
  let backgroundHash;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const started = performance.now();
    const results = await capture(mode, run, requests, concurrency);
    samples.push(performance.now() - started);
    backgroundHash = assertResults(results, count);
  }
  const sorted = [...samples].sort((left, right) => left - right);
  process.stdout.write(
    `${JSON.stringify({ mode, count, concurrency, samplesMs: samples, medianMs: sorted[Math.floor(iterations / 2)], backgroundHash })}\n`,
  );
} finally {
  await run.close();
}

async function capture(selectedMode, browser, items, workers) {
  if (selectedMode === 'batch') {
    if (browser.captureMany === undefined) {
      throw new TypeError('The selected driver does not support captureMany.');
    }
    return browser.captureMany(items);
  }
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(workers, items.length) }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await browser.capture(items[index]);
      }
    }),
  );
  return results;
}

function assertResults(results, expected) {
  if (results.length !== expected) {
    throw new Error(
      `Expected ${expected} results, received ${results.length}.`,
    );
  }
  const identities = new Set(results.map(({ scene }) => scene.recipeId));
  const backgrounds = new Set(
    results.map(({ scene }) => scene.background.sha256),
  );
  if (identities.size !== expected || backgrounds.size !== 1) {
    throw new Error('Capture results did not preserve identities and pixels.');
  }
  return [...backgrounds][0];
}

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new TypeError(`${label} must be a positive integer.`);
  }
  return parsed;
}

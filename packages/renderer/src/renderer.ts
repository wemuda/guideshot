import { createHash } from 'node:crypto';

import {
  chromium,
  type Browser,
  type BrowserContext,
  type LaunchOptions,
  type Page,
} from 'playwright';
import packageJson from '../package.json' with { type: 'json' };

import type {
  AnnotationRenderer,
  CompositionRequest,
  RenderedAsset,
  RendererRun,
} from './contracts.js';
import { normalizeAnnotations } from './annotations.js';
import {
  buildMeasurementHtml,
  createCompositionHtml,
  layoutAnnotations,
  mimeTypeFor,
  normalizeFormats,
  resolveOutputSize,
  type MeasuredBox,
  type OutputFormat,
} from './document.js';
import { loadBundledFont } from './font.js';
import type { Size } from './placement.js';
import { resolveTheme } from './theme.js';

export interface HtmlRendererOptions {
  readonly launchOptions?: LaunchOptions;
}

const RENDERER_NAME = 'guideshot:html';
const RENDERER_VERSION = packageJson.version;

export function htmlRenderer(
  options: HtmlRendererOptions = {},
): AnnotationRenderer {
  return {
    name: RENDERER_NAME,
    version: RENDERER_VERSION,
    apiVersion: 1,
    async open() {
      const [browser, font] = await Promise.all([
        chromium.launch({ headless: true, ...options.launchOptions }),
        loadBundledFont(),
      ]);
      return new HtmlRendererRun(browser, font);
    },
  };
}

class HtmlRendererRun implements RendererRun {
  readonly #browser: Browser;
  readonly #font: Uint8Array;
  readonly #slots = new Set<RendererSlot>();
  readonly #idleSlots: RendererSlot[] = [];
  #closed = false;

  constructor(browser: Browser, font: Uint8Array) {
    this.#browser = browser;
    this.#font = font;
  }

  async render(request: CompositionRequest): Promise<readonly RenderedAsset[]> {
    this.#assertOpen();
    validateRequest(request);

    const annotations = normalizeAnnotations(request.annotations);
    const outputSize = resolveOutputSize(request.scene, request.output);
    const theme = resolveTheme(request.theme, request.scene.theme);
    const formats = normalizeFormats(request.output.formats);
    const slot = await this.#acquireSlot(outputSize);
    const { page } = slot;

    try {
      const measurements = await measureAnnotations(page, {
        annotations,
        frameWidth: request.scene.frame.width,
        theme,
        font: this.#font,
      });
      const layout = layoutAnnotations({
        scene: request.scene,
        annotations,
        measurements,
      });
      const html = createCompositionHtml({
        scene: request.scene,
        background: request.background,
        annotations,
        measurements,
        layout,
        outputSize,
        theme,
        font: this.#font,
      });

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await waitForDocument(page);
      await verifyBackgroundDimensions(
        page,
        request.scene.background.width,
        request.scene.background.height,
      );

      const quality = webpQuality(request.output.quality);
      const assets: RenderedAsset[] = [];
      for (const format of formats) {
        const bytes = await screenshot(page, format, quality);
        assets.push({
          format,
          mimeType: mimeTypeFor(format),
          bytes: Uint8Array.from(bytes),
          width: outputSize.width,
          height: outputSize.height,
        });
      }
      return assets;
    } finally {
      this.#releaseSlot(slot);
    }
  }

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    await Promise.allSettled(
      [...this.#slots].map(async ({ context }) => context.close()),
    );
    this.#slots.clear();
    this.#idleSlots.length = 0;
    await this.#browser.close();
  }

  #assertOpen(): void {
    if (this.#closed) throw new Error('Renderer run is closed.');
  }

  async #acquireSlot(outputSize: {
    width: number;
    height: number;
  }): Promise<RendererSlot> {
    this.#assertOpen();
    const existing = this.#idleSlots.pop();
    const slot = existing ?? (await this.#createSlot(outputSize));
    try {
      if (existing !== undefined) await slot.page.setViewportSize(outputSize);
      return slot;
    } catch (error) {
      this.#slots.delete(slot);
      await slot.context.close().catch(() => undefined);
      throw error;
    }
  }

  async #createSlot(outputSize: {
    width: number;
    height: number;
  }): Promise<RendererSlot> {
    const context = await this.#browser.newContext({
      viewport: outputSize,
      screen: outputSize,
      deviceScaleFactor: 1,
      locale: 'en',
      timezoneId: 'UTC',
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    });
    try {
      await context.setOffline(true);
      await context.route('**/*', async (route) =>
        route.abort('blockedbyclient'),
      );
      const slot = { context, page: await context.newPage() };
      this.#slots.add(slot);
      return slot;
    } catch (error) {
      await context.close();
      throw error;
    }
  }

  #releaseSlot(slot: RendererSlot): void {
    if (this.#closed || slot.page.isClosed()) {
      this.#slots.delete(slot);
      return;
    }
    this.#idleSlots.push(slot);
  }
}

interface RendererSlot {
  readonly context: BrowserContext;
  readonly page: Page;
}

async function measureAnnotations(
  page: Page,
  input: Parameters<typeof buildMeasurementHtml>[0],
): Promise<ReadonlyMap<string, Size>> {
  await page.setContent(buildMeasurementHtml(input), {
    waitUntil: 'domcontentloaded',
  });
  await waitForFonts(page);
  const measured = await page
    .locator('[data-measure-id]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        return {
          id: htmlElement.dataset.measureId ?? '',
          width: rect.width,
          height: rect.height,
        };
      }),
    );
  const result = new Map<string, Size>();
  for (const box of measured as MeasuredBox[]) {
    if (
      !box.id ||
      !Number.isFinite(box.width) ||
      !Number.isFinite(box.height)
    ) {
      throw new Error('Chromium returned invalid annotation measurements.');
    }
    result.set(box.id, { width: box.width, height: box.height });
  }
  return result;
}

async function waitForDocument(page: Page): Promise<void> {
  await waitForFonts(page);
  await page.locator('.background').evaluate(async (element) => {
    const image = element as HTMLImageElement;
    if (!image.complete) await image.decode();
    if (image.naturalWidth === 0 || image.naturalHeight === 0) {
      throw new Error('Scene background could not be decoded.');
    }
  });
}

async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function verifyBackgroundDimensions(
  page: Page,
  expectedWidth: number,
  expectedHeight: number,
): Promise<void> {
  const actual = await page.locator('.background').evaluate((element) => {
    const image = element as HTMLImageElement;
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  if (actual.width !== expectedWidth || actual.height !== expectedHeight) {
    throw new Error(
      `Scene background dimensions are ${actual.width}x${actual.height}; expected ${expectedWidth}x${expectedHeight}.`,
    );
  }
}

function screenshot(page: Page, format: OutputFormat, quality: number) {
  if (format === 'webp') {
    return page.screenshot({
      type: 'webp',
      quality,
      animations: 'disabled',
      caret: 'hide',
    });
  }
  return page.screenshot({
    type: 'png',
    animations: 'disabled',
    caret: 'hide',
  });
}

function validateRequest(request: CompositionRequest): void {
  if (request.scene.version !== 1) {
    throw new TypeError(
      `Unsupported scene version "${String(request.scene.version)}".`,
    );
  }
  if (request.scene.sanitized !== true) {
    throw new TypeError('Renderer refuses to compose an unsanitized scene.');
  }
  const actualHash = createHash('sha256')
    .update(request.background)
    .digest('hex');
  if (actualHash !== request.scene.background.sha256.toLowerCase()) {
    throw new TypeError(
      'Scene background does not match its SHA-256 metadata.',
    );
  }
  if (request.scene.background.format !== 'png') {
    throw new TypeError('Only sanitized PNG scene backgrounds are supported.');
  }
}

function webpQuality(value: number | undefined): number {
  if (value === undefined) return 92;
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new RangeError('WebP quality must be an integer from 0 through 100.');
  }
  return value;
}

import { execFile } from 'node:child_process';

import {
  GuideShotError,
  isGuideShotError,
  sha256,
  type BrowserCookie,
  type BrowserDriver,
  type BrowserEnvironment,
  type BrowserRun,
  type BrowserStatePatch,
  type CaptureRequest,
  type CaptureResult,
  type DriverRunOptions,
  type Frame,
  type Rect,
  type SceneTarget,
} from '@guideshot/core';
import {
  chromium,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  type LaunchOptions,
  type Page,
  type Request,
} from 'playwright';

import { executeActions } from './actions.js';
import { verifyExpectations } from './expectations.js';
import { relativeRect, resolveFrameRect } from './frame.js';
import {
  prepareForCapture,
  requireVisibleTargets,
  sampleStableTargets,
} from './readiness.js';
import {
  assertTargetAttribute,
  TargetResolver,
  type TargetErrorContext,
} from './targets.js';

const DRIVER_VERSION = '0.1.0';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_NAVIGATION_TIMEOUT_MS = 15_000;

export interface PlaywrightDriverOptions {
  readonly launchOptions?: LaunchOptions;
  readonly timeoutMs?: number;
  readonly navigationTimeoutMs?: number;
  readonly stabilitySamples?: number;
  readonly stabilityIntervalMs?: number;
  readonly stabilityTolerance?: number;
}

interface NormalizedDriverOptions {
  readonly launchOptions: LaunchOptions;
  readonly timeoutMs: number;
  readonly navigationTimeoutMs: number;
  readonly stabilitySamples: number;
  readonly stabilityIntervalMs: number;
  readonly stabilityTolerance: number;
}

export function playwrightDriver(
  options: PlaywrightDriverOptions = {},
): BrowserDriver {
  const normalized = normalizeOptions(options);
  return {
    name: '@guideshot/playwright',
    version: DRIVER_VERSION,
    apiVersion: 1,
    describeEnvironment: () => describeEnvironment(normalized),
    open: async (runOptions) => openRun(normalized, runOptions),
  };
}

async function openRun(
  options: NormalizedDriverOptions,
  runOptions: DriverRunOptions,
): Promise<BrowserRun> {
  assertTargetAttribute(runOptions.targetAttribute);
  assertBaseUrl(runOptions.baseUrl);
  throwIfAborted(runOptions.signal);

  let browser: Browser;
  try {
    browser = await chromium.launch(options.launchOptions);
  } catch (cause) {
    throw new GuideShotError('CAPTURE_FAILED', 'Unable to launch Chromium.', {
      cause,
    });
  }
  const environment = browserEnvironment(browser);
  return new ChromiumRun(browser, environment, options, runOptions);
}

class ChromiumRun implements BrowserRun {
  readonly #browser: Browser;
  readonly #environment: BrowserEnvironment;
  readonly #options: NormalizedDriverOptions;
  readonly #runOptions: DriverRunOptions;
  #closed = false;

  constructor(
    browser: Browser,
    environment: BrowserEnvironment,
    options: NormalizedDriverOptions,
    runOptions: DriverRunOptions,
  ) {
    this.#browser = browser;
    this.#environment = environment;
    this.#options = options;
    this.#runOptions = runOptions;
  }

  async capture(request: CaptureRequest): Promise<CaptureResult> {
    if (this.#closed) {
      throw new GuideShotError(
        'CAPTURE_FAILED',
        'The browser run is already closed.',
      );
    }
    throwIfAborted(this.#runOptions.signal);

    const context = await this.#newContext(request);
    const errorContext: TargetErrorContext = {
      recipeId: request.job.recipeId,
      jobKey: request.job.key,
    };
    const guard = new NavigationGuard(
      context,
      this.#runOptions.baseUrl.origin,
      errorContext,
      request.job.browser.extraHTTPHeaders,
    );
    let aborted = false;
    const abort = (): void => {
      aborted = true;
      void context.close();
    };
    this.#runOptions.signal?.addEventListener('abort', abort, { once: true });

    try {
      await applyBrowserState(
        context,
        request.job.browser,
        this.#runOptions.baseUrl,
      );
      await guard.install();
      const page = await context.newPage();
      page.setDefaultTimeout(this.#options.timeoutMs);
      page.setDefaultNavigationTimeout(this.#options.navigationTimeoutMs);

      await navigate(page, request, this.#runOptions.baseUrl, errorContext);
      guard.throwIfBlocked();

      const resolver = new TargetResolver(
        page,
        this.#runOptions.targetAttribute,
        this.#options.timeoutMs,
        errorContext,
      );
      await executeActions(
        resolver,
        request.job.prepare,
        this.#options.timeoutMs,
        errorContext,
      );
      guard.throwIfBlocked();
      await verifyExpectations(
        page,
        resolver,
        request.job.ready,
        this.#options.timeoutMs,
        errorContext,
      );
      guard.throwIfBlocked();

      await prepareForCapture(page, this.#options.timeoutMs, errorContext);
      const allowedMultiple = new Set(
        request.job.ready.flatMap((expectation) =>
          expectation.expect === 'count' ? [expectation.target] : [],
        ),
      );
      const measurements = await sampleStableTargets(
        resolver,
        allowedMultiple,
        {
          samples: this.#options.stabilitySamples,
          intervalMs: this.#options.stabilityIntervalMs,
          tolerance: this.#options.stabilityTolerance,
        },
        errorContext,
      );
      const frameDefinition = requestedFrame(request.job.capture);
      const requiredTargets = frameTargetIds(frameDefinition);
      requireVisibleTargets(
        measurements,
        requiredTargets,
        resolver,
        errorContext,
      );

      const pageState = await measurePage(page);
      const targetRects = Object.fromEntries(
        Object.entries(measurements).map(([id, target]) => [id, target.rect]),
      );
      const frame = resolveFrameRect({
        ...(frameDefinition === undefined ? {} : { frame: frameDefinition }),
        document: pageState.document,
        viewport: pageState.viewport,
        targets: targetRects,
      });
      if (frame.width <= 0 || frame.height <= 0) {
        throw new GuideShotError(
          'CAPTURE_FAILED',
          'The resolved capture frame is empty.',
          {
            ...errorContext,
            details: {
              frame: {
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
              },
            },
          },
        );
      }

      guard.throwIfBlocked();
      const screenshot = await page.screenshot({
        type: 'png',
        clip: frame,
        animations: 'disabled',
        caret: 'hide',
        scale: 'device',
        mask: [resolver.privacyLocator()],
        maskColor: '#000000',
      });
      guard.throwIfBlocked();

      const background = Uint8Array.from(screenshot);
      const imageSize = readPngSize(background);
      const targets: Record<string, SceneTarget> = Object.fromEntries(
        Object.entries(measurements).map(([id, target]) => [
          id,
          {
            rect: relativeRect(target.rect, frame),
            visible: target.visible,
            ...(target.borderRadius === undefined
              ? {}
              : { borderRadius: target.borderRadius }),
          },
        ]),
      );
      const scene = {
        version: 1 as const,
        captureKey: request.captureKey,
        recipeId: request.job.recipeId,
        variantKey: request.job.variantKey,
        variants: request.job.variants,
        frame,
        viewport: {
          width: pageState.viewport.width,
          height: pageState.viewport.height,
          pixelRatio: pageState.pixelRatio,
          scrollX: pageState.scrollX,
          scrollY: pageState.scrollY,
        },
        targets,
        locale: pageState.locale,
        direction: pageState.direction,
        ...(pageState.theme === undefined ? {} : { theme: pageState.theme }),
        safeVariables: request.job.safeVariables,
        background: {
          file: `${request.captureKey}.png`,
          width: imageSize.width,
          height: imageSize.height,
          format: 'png' as const,
          sha256: sha256(background),
        },
        environment: this.#environment,
        sanitized: true as const,
      };
      return { scene, background };
    } catch (cause) {
      const blocked = guard.blockedError();
      if (blocked !== undefined) throw blocked;
      if (aborted || this.#runOptions.signal?.aborted === true) {
        throw new GuideShotError('CAPTURE_FAILED', 'Capture was cancelled.', {
          ...errorContext,
          cause,
        });
      }
      if (isGuideShotError(cause)) throw cause;
      throw new GuideShotError('CAPTURE_FAILED', 'Chromium capture failed.', {
        ...errorContext,
        cause,
      });
    } finally {
      this.#runOptions.signal?.removeEventListener('abort', abort);
      await context.close().catch(() => undefined);
    }
  }

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    await this.#browser.close();
  }

  async #newContext(request: CaptureRequest): Promise<BrowserContext> {
    try {
      return await this.#browser.newContext(
        contextOptions(
          request.job.profile,
          request.job.browser,
          requestedPixelRatio(request.job.capture),
        ),
      );
    } catch (cause) {
      throw new GuideShotError(
        'CAPTURE_FAILED',
        'Unable to create browser context.',
        {
          recipeId: request.job.recipeId,
          jobKey: request.job.key,
          cause,
        },
      );
    }
  }
}

class NavigationGuard {
  readonly #context: BrowserContext;
  readonly #baseOrigin: string;
  readonly #errorContext: TargetErrorContext;
  readonly #extraHTTPHeaders: Readonly<Record<string, string>> | undefined;
  #blockedUrl: string | undefined;

  constructor(
    context: BrowserContext,
    baseOrigin: string,
    errorContext: TargetErrorContext,
    extraHTTPHeaders: Readonly<Record<string, string>> | undefined,
  ) {
    this.#context = context;
    this.#baseOrigin = baseOrigin;
    this.#errorContext = errorContext;
    this.#extraHTTPHeaders = extraHTTPHeaders;
  }

  async install(): Promise<void> {
    await this.#context.route('**/*', async (route) => {
      const request = route.request();
      if (isTopLevelNavigation(request) && !this.#isAllowed(request.url())) {
        this.#blockedUrl ??= request.url();
        await route.abort('blockedbyclient');
        return;
      }
      await route.continue(
        this.#extraHTTPHeaders !== undefined && this.#isAllowed(request.url())
          ? {
              headers: {
                ...request.headers(),
                ...this.#extraHTTPHeaders,
              },
            }
          : undefined,
      );
    });
    this.#context.on('page', (page) => {
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame() && !this.#isAllowed(frame.url())) {
          this.#blockedUrl ??= frame.url();
        }
      });
    });
  }

  throwIfBlocked(): void {
    const error = this.blockedError();
    if (error !== undefined) throw error;
  }

  blockedError(): GuideShotError | undefined {
    if (this.#blockedUrl === undefined) return undefined;
    return new GuideShotError(
      'ORIGIN_NOT_ALLOWED',
      `Top-level navigation to "${this.#blockedUrl}" was blocked.`,
      {
        ...this.#errorContext,
        details: {
          origin: safeOrigin(this.#blockedUrl),
          url: this.#blockedUrl,
        },
      },
    );
  }

  #isAllowed(value: string): boolean {
    if (value === 'about:blank') return true;
    try {
      return new URL(value).origin === this.#baseOrigin;
    } catch {
      return false;
    }
  }
}

async function navigate(
  page: Page,
  request: CaptureRequest,
  baseUrl: URL,
  context: TargetErrorContext,
): Promise<void> {
  let url: URL;
  try {
    url = new URL(request.job.page.path, baseUrl);
  } catch (cause) {
    throw new GuideShotError(
      'NAVIGATION_FAILED',
      'The recipe page path is invalid.',
      {
        ...context,
        cause,
      },
    );
  }
  if (url.origin !== baseUrl.origin) {
    throw new GuideShotError(
      'ORIGIN_NOT_ALLOWED',
      `Page path "${request.job.page.path}" resolves outside the configured origin.`,
      { ...context, details: { origin: url.origin } },
    );
  }
  try {
    await page.goto(url.href, { waitUntil: 'domcontentloaded' });
  } catch (cause) {
    throw new GuideShotError(
      'NAVIGATION_FAILED',
      `Navigation to "${url.pathname}" failed.`,
      { ...context, cause },
    );
  }
}

async function applyBrowserState(
  context: BrowserContext,
  state: BrowserStatePatch,
  baseUrl: URL,
): Promise<void> {
  if ((state.localStorage?.length ?? 0) > 0) {
    await context.addInitScript((entries) => {
      const entry = entries.find(
        (candidate) => candidate.origin === location.origin,
      );
      if (entry === undefined) return;
      for (const [key, value] of Object.entries(entry.values)) {
        localStorage.setItem(key, value);
      }
    }, state.localStorage ?? []);
  }
  if ((state.cookies?.length ?? 0) > 0) {
    await context.addCookies(
      (state.cookies ?? []).map((cookie) => playwrightCookie(cookie, baseUrl)),
    );
  }
}

function contextOptions(
  profile: CaptureRequest['job']['profile'],
  browser: BrowserStatePatch,
  capturePixelRatio: number | undefined,
): BrowserContextOptions {
  return {
    viewport: { ...profile.viewport },
    deviceScaleFactor: capturePixelRatio ?? profile.pixelRatio ?? 1,
    locale: browser.locale ?? profile.locale ?? 'en-US',
    ...((browser.timezoneId ?? profile.timezoneId) === undefined
      ? {}
      : { timezoneId: browser.timezoneId ?? profile.timezoneId }),
    ...((browser.colorScheme ?? profile.colorScheme) === undefined
      ? {}
      : { colorScheme: browser.colorScheme ?? profile.colorScheme }),
    ...((browser.reducedMotion ?? profile.reducedMotion) === undefined
      ? {}
      : { reducedMotion: browser.reducedMotion ?? profile.reducedMotion }),
  };
}

function playwrightCookie(
  cookie: BrowserCookie,
  baseUrl: URL,
): Parameters<BrowserContext['addCookies']>[0][number] {
  return {
    name: cookie.name,
    value: cookie.value,
    ...(cookie.url === undefined && cookie.domain === undefined
      ? { url: baseUrl.origin }
      : {}),
    ...(cookie.url === undefined ? {} : { url: cookie.url }),
    ...(cookie.domain === undefined ? {} : { domain: cookie.domain }),
    ...(cookie.path === undefined ? {} : { path: cookie.path }),
    ...(cookie.expires === undefined ? {} : { expires: cookie.expires }),
    ...(cookie.httpOnly === undefined ? {} : { httpOnly: cookie.httpOnly }),
    ...(cookie.secure === undefined ? {} : { secure: cookie.secure }),
    ...(cookie.sameSite === undefined ? {} : { sameSite: cookie.sameSite }),
  };
}

interface PageMeasurement {
  readonly document: Rect;
  readonly viewport: Rect;
  readonly pixelRatio: number;
  readonly scrollX: number;
  readonly scrollY: number;
  readonly locale: string;
  readonly direction: 'ltr' | 'rtl';
  readonly theme?: string;
}

async function measurePage(page: Page): Promise<PageMeasurement> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const width = Math.max(
      root.scrollWidth,
      root.clientWidth,
      body?.scrollWidth ?? 0,
      body?.clientWidth ?? 0,
      window.innerWidth,
    );
    const height = Math.max(
      root.scrollHeight,
      root.clientHeight,
      body?.scrollHeight ?? 0,
      body?.clientHeight ?? 0,
      window.innerHeight,
    );
    const direction =
      getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
    const declaredTheme = root.dataset.theme;
    const theme =
      declaredTheme ??
      (root.classList.contains('dark')
        ? 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light');
    return {
      document: { x: 0, y: 0, width, height },
      viewport: {
        x: scrollX,
        y: scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      pixelRatio: window.devicePixelRatio,
      scrollX,
      scrollY,
      locale: root.lang || navigator.language || 'en',
      direction,
      theme,
    };
  });
}

function requestedFrame(
  capture: CaptureRequest['job']['capture'],
): Frame | undefined {
  return 'frame' in capture ? capture.frame : undefined;
}

function requestedPixelRatio(
  capture: CaptureRequest['job']['capture'],
): number | undefined {
  return 'pixelRatio' in capture ? capture.pixelRatio : undefined;
}

function frameTargetIds(frame: Frame | undefined): readonly string[] {
  if (frame === undefined || 'kind' in frame || 'region' in frame) return [];
  if ('target' in frame) return [frame.target];
  return frame.around;
}

function isTopLevelNavigation(request: Request): boolean {
  if (!request.isNavigationRequest()) return false;
  try {
    return request.frame().parentFrame() === null;
  } catch {
    return false;
  }
}

function readPngSize(bytes: Uint8Array): { width: number; height: number } {
  if (
    bytes.byteLength < 24 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    throw new GuideShotError(
      'CAPTURE_FAILED',
      'Chromium returned an invalid PNG image.',
    );
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

async function describeEnvironment(
  options: NormalizedDriverOptions,
): Promise<BrowserEnvironment> {
  const executable =
    options.launchOptions.executablePath ?? chromium.executablePath();
  try {
    const version = await executableVersion(executable);
    return {
      driver: '@guideshot/playwright',
      driverVersion: DRIVER_VERSION,
      browser: 'chromium',
      browserVersion: version,
      platform: `${process.platform}-${process.arch}`,
    };
  } catch (cause) {
    throw new GuideShotError(
      'CAPTURE_FAILED',
      'Unable to inspect the installed Chromium executable.',
      { cause },
    );
  }
}

function executableVersion(executable: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      executable,
      ['--version'],
      { encoding: 'utf8', timeout: DEFAULT_TIMEOUT_MS },
      (error, stdout) => {
        if (error !== null) {
          reject(
            new Error('Chromium version command failed.', { cause: error }),
          );
          return;
        }
        resolve(stdout.trim());
      },
    );
  });
}

function browserEnvironment(browser: Browser): BrowserEnvironment {
  return {
    driver: '@guideshot/playwright',
    driverVersion: DRIVER_VERSION,
    browser: 'chromium',
    browserVersion: browser.version(),
    platform: `${process.platform}-${process.arch}`,
  };
}

function normalizeOptions(
  options: PlaywrightDriverOptions,
): NormalizedDriverOptions {
  return {
    launchOptions: {
      headless: true,
      ...options.launchOptions,
    },
    timeoutMs: positiveInteger(
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      'timeoutMs',
    ),
    navigationTimeoutMs: positiveInteger(
      options.navigationTimeoutMs ?? DEFAULT_NAVIGATION_TIMEOUT_MS,
      'navigationTimeoutMs',
    ),
    stabilitySamples: positiveInteger(
      options.stabilitySamples ?? 3,
      'stabilitySamples',
    ),
    stabilityIntervalMs: positiveInteger(
      options.stabilityIntervalMs ?? 50,
      'stabilityIntervalMs',
    ),
    stabilityTolerance: nonNegativeNumber(
      options.stabilityTolerance ?? 0.25,
      'stabilityTolerance',
    ),
  };
}

function positiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive integer.`);
  }
  return value;
}

function nonNegativeNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a finite non-negative number.`);
  }
  return value;
}

function assertBaseUrl(baseUrl: URL): void {
  if (
    (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') ||
    baseUrl.username !== '' ||
    baseUrl.password !== ''
  ) {
    throw new GuideShotError(
      'ORIGIN_NOT_ALLOWED',
      'Invalid browser base URL.',
      {
        details: { origin: baseUrl.origin },
      },
    );
  }
}

function safeOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return 'null';
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted === true) {
    throw new GuideShotError('CAPTURE_FAILED', 'Capture was cancelled.');
  }
}

import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import {
  createAssetPath,
  createJobCompositionHash,
  diagnosticFromUnknown,
  GuideShotError,
  interpolate,
  planProject,
  PublicManifestSchema,
  RecipeSchema,
  resolveJob,
  resolveRecipeText,
  resolveSafeProjectPaths,
  resolvedAlt,
  resolvedAnnotations,
  validateConfig,
  validateRecipe,
  type BrowserRun,
  type CompositionOutput,
  type GuideShotConfig,
  type ManifestAssetInput,
  type Plan,
  type PlannedJob,
  type Recipe,
  type RendererRun,
  type VariantValue,
} from '@guideshot/core';

import { verifyRenderedAsset } from './assets.js';
import { SceneCache, type CachedScene } from './cache.js';
import { loadGuideShotConfig } from './config.js';
import {
  jobIdentity,
  mergeManifest,
  OutputTransaction,
  readExistingManifest,
  type ManifestReplacementScope,
} from './publication.js';
import { ensureServer, type ServerHandle } from './server.js';
import type {
  CommandName,
  CommandOptions,
  CommandReport,
  CommandSelection,
  JobReport,
  ServiceOptions,
} from './types.js';
import { verifyPublishedOutput } from './verify.js';

interface ProjectContext {
  readonly config: GuideShotConfig;
  readonly projectRoot: string;
  readonly outputDir: string;
  readonly cacheDir: string;
}

interface ComposedJob {
  readonly report: JobReport;
  readonly staged: {
    readonly manifest: ManifestAssetInput;
    readonly bytes: Uint8Array;
  };
}

export class GuideShotService {
  readonly #options: ServiceOptions;

  constructor(options: ServiceOptions = {}) {
    this.#options = options;
  }

  validate(options: CommandOptions = {}): Promise<CommandReport> {
    return this.execute('validate', options);
  }

  schema(options: CommandOptions = {}): Promise<CommandReport> {
    return this.execute('schema', options);
  }

  plan(options: CommandOptions = {}): Promise<CommandReport> {
    return this.execute('plan', options);
  }

  capture(options: CommandOptions = {}): Promise<CommandReport> {
    return this.execute('capture', options);
  }

  compose(options: CommandOptions = {}): Promise<CommandReport> {
    return this.execute('compose', options);
  }

  verify(options: CommandOptions = {}): Promise<CommandReport> {
    return this.execute('verify', options);
  }

  async execute(
    command: CommandName,
    options: CommandOptions = {},
  ): Promise<CommandReport> {
    try {
      switch (command) {
        case 'validate':
          return await this.#validate(options);
        case 'schema':
          return await this.#schema(options);
        case 'plan':
          return await this.#plan(options);
        case 'capture':
          return await this.#capture(options);
        case 'compose':
          return await this.#compose(options);
        case 'verify':
          return await this.#verify(options);
      }
    } catch (error) {
      return {
        version: 1,
        command,
        ok: false,
        summary: { recipes: 0, jobs: 0 },
        jobs: [],
        diagnostics: [diagnosticFromUnknown(error, fallbackCode(command))],
      };
    }
  }

  async #validate(options: CommandOptions): Promise<CommandReport> {
    const context = await this.#loadProject(options.configFile);
    const plan = await this.#createPlan(context, options);
    return successReport('validate', plan, plannedReports(plan));
  }

  async #plan(options: CommandOptions): Promise<CommandReport> {
    const context = await this.#loadProject(options.configFile);
    const plan = await this.#createPlan(context, options);
    return successReport('plan', plan, plannedReports(plan));
  }

  async #schema(options: CommandOptions): Promise<CommandReport> {
    const projectRoot = this.#schemaRoot(options.configFile);
    const schemaDir = path.join(projectRoot, '.guideshot');
    const recipeSchema = path.join(schemaDir, 'recipe.schema.json');
    const manifestSchema = path.join(schemaDir, 'manifest.schema.json');
    await mkdir(schemaDir, { recursive: true });
    await Promise.all([
      writeAtomic(recipeSchema, `${JSON.stringify(RecipeSchema, null, 2)}\n`),
      writeAtomic(
        manifestSchema,
        `${JSON.stringify(PublicManifestSchema, null, 2)}\n`,
      ),
    ]);
    return {
      version: 1,
      command: 'schema',
      ok: true,
      summary: { recipes: 0, jobs: 0 },
      jobs: [],
      diagnostics: [],
      outputs: [
        relativePath(projectRoot, recipeSchema),
        relativePath(projectRoot, manifestSchema),
      ],
    };
  }

  async #capture(options: CommandOptions): Promise<CommandReport> {
    const context = await this.#loadProject(options.configFile);
    const plan = await this.#createPlan(context, options);
    requireJobs(plan, 'capture');
    this.#reportCaptureProgress({
      phase: 'preparing',
      completed: 0,
      total: plan.jobs.length,
    });
    const cache = new SceneCache(context.cacheDir);
    const transaction = await OutputTransaction.create(context.outputDir);
    const fetcher = this.#options.fetch ?? globalThis.fetch;
    const concurrency = captureConcurrency(context.config, options.concurrency);
    let server: ServerHandle | undefined;
    let driver: BrowserRun | undefined;
    let renderer: RendererRun | undefined;

    try {
      server = await ensureServer({
        config: context.config.server,
        cwd: context.projectRoot,
        fetch: fetcher,
        ...(context.config.safety?.allowedOrigins === undefined
          ? {}
          : { allowedOrigins: context.config.safety.allowedOrigins }),
        ...(this.#options.signal === undefined
          ? {}
          : { signal: this.#options.signal }),
      });
      driver = await context.config.driver.open({
        baseUrl: server.baseUrl,
        targetAttribute: context.config.targetAttribute ?? 'data-guide-target',
        ...(this.#options.signal === undefined
          ? {}
          : { signal: this.#options.signal }),
      });
      renderer = await context.config.renderer.open();
      const activeServer = server;
      const activeDriver = driver;
      const activeRenderer = renderer;

      let completed = 0;
      const composed = await runConcurrent(
        plan.jobs,
        concurrency,
        (job) => scenarioConcurrencyKey(job, context.config),
        async (job) => {
          throwIfAborted(this.#options.signal);
          this.#reportCaptureProgress({
            phase: 'capturing',
            completed,
            total: plan.jobs.length,
            jobKey: job.key,
          });
          const composition = await captureJob({
            job,
            config: context.config,
            baseUrl: activeServer.baseUrl,
            fetch: fetcher,
            cache,
            transaction,
            driver: activeDriver,
            renderer: activeRenderer,
            ...(this.#options.signal === undefined
              ? {}
              : { signal: this.#options.signal }),
          });
          completed += 1;
          this.#reportCaptureProgress({
            phase: 'capturing',
            completed,
            total: plan.jobs.length,
            jobKey: job.key,
          });
          return composition;
        },
      );

      await closeRenderer(renderer);
      renderer = undefined;
      await closeDriver(driver);
      driver = undefined;
      await server.close();
      server = undefined;

      this.#reportCaptureProgress({
        phase: 'publishing',
        completed: composed.length,
        total: plan.jobs.length,
      });

      const replacementScope = manifestReplacementScope(plan, options);
      const existing = await readExistingManifest(context.outputDir);
      const manifest = mergeManifest(
        replacementScope.mode === 'all' ? undefined : existing,
        composed.map(({ staged }) => staged.manifest),
        replacementScope,
      );
      await transaction.commit(manifest, existing);
      this.#reportCaptureProgress({
        phase: 'complete',
        completed: composed.length,
        total: plan.jobs.length,
      });
      return successReport(
        'capture',
        plan,
        composed.map(({ report }) => report),
        composed.length,
        [
          relativePath(
            context.projectRoot,
            path.join(context.outputDir, 'manifest.json'),
          ),
        ],
      );
    } finally {
      await closeRenderer(renderer);
      await closeDriver(driver);
      await server?.close();
      await transaction.close();
    }
  }

  async #compose(options: CommandOptions): Promise<CommandReport> {
    const context = await this.#loadProject(options.configFile);
    const plan = await this.#createPlan(context, options);
    requireJobs(plan, 'compose');
    const cache = new SceneCache(context.cacheDir);
    const transaction = await OutputTransaction.create(context.outputDir);
    let renderer: RendererRun | undefined;

    try {
      renderer = await context.config.renderer.open();
      const composed: ComposedJob[] = [];
      for (const job of plan.jobs) {
        throwIfAborted(this.#options.signal);
        const cached = await cache.read(job.captureKey);
        assertSceneIdentity(cached.scene, job);
        const recipe = await resolveCachedRecipe(job, context.config, cached);
        const composition = await composeJob(job, recipe, cached, renderer);
        await transaction.stage(composition.staged);
        composed.push(composition);
      }

      await closeRenderer(renderer);
      renderer = undefined;
      const replacementScope = manifestReplacementScope(plan, options);
      const existing = await readExistingManifest(context.outputDir);
      const manifest = mergeManifest(
        replacementScope.mode === 'all' ? undefined : existing,
        composed.map(({ staged }) => staged.manifest),
        replacementScope,
      );
      await transaction.commit(manifest, existing);
      return successReport(
        'compose',
        plan,
        composed.map(({ report }) => report),
        composed.length,
        [
          relativePath(
            context.projectRoot,
            path.join(context.outputDir, 'manifest.json'),
          ),
        ],
      );
    } finally {
      await closeRenderer(renderer);
      await transaction.close();
    }
  }

  async #verify(options: CommandOptions): Promise<CommandReport> {
    const context = await this.#loadProject(options.configFile);
    const plan = await this.#createPlan(context, options);
    requireJobs(plan, 'verify');
    const result = await verifyPublishedOutput(context.outputDir, plan);
    return successReport('verify', plan, result.jobs, result.assets, [
      relativePath(
        context.projectRoot,
        path.join(context.outputDir, 'manifest.json'),
      ),
    ]);
  }

  async #loadProject(configFile?: string): Promise<ProjectContext> {
    const cwd = path.resolve(this.#options.cwd ?? process.cwd());
    let config: GuideShotConfig;
    let projectRoot: string;
    if (this.#options.config !== undefined) {
      if (configFile !== undefined || this.#options.configFile !== undefined) {
        throw new TypeError(
          'A config object and --config file cannot be used together.',
        );
      }
      config = this.#options.config;
      projectRoot = cwd;
      validateConfig(config);
    } else {
      const loaded = await loadGuideShotConfig(
        cwd,
        configFile ?? this.#options.configFile,
      );
      config = loaded.config;
      projectRoot = loaded.projectRoot;
    }
    const paths = resolveSafeProjectPaths(
      projectRoot,
      config.outputDir,
      config.cacheDir,
    );
    return { config, projectRoot, ...paths };
  }

  async #createPlan(
    context: ProjectContext,
    selection: CommandOptions,
  ): Promise<Plan> {
    const rawDimensions = resolveDimensionArguments(
      context.config,
      selection.dimensionArguments ?? [],
    );
    const dimensions = mergeDimensions(selection.dimensions, rawDimensions);
    validateSelection(context.config, { ...selection, dimensions });
    return planProject(context.config, context.projectRoot, {
      ...(selection.ids === undefined
        ? {}
        : { ids: uniqueSorted(selection.ids) }),
      ...(selection.tags === undefined
        ? {}
        : { tags: uniqueSorted(selection.tags) }),
      ...(Object.keys(dimensions).length === 0 ? {} : { variants: dimensions }),
    });
  }

  #schemaRoot(configFile?: string): string {
    const cwd = path.resolve(this.#options.cwd ?? process.cwd());
    const selected = configFile ?? this.#options.configFile;
    return selected === undefined
      ? cwd
      : path.dirname(path.resolve(cwd, selected));
  }

  #reportCaptureProgress(
    progress: Parameters<NonNullable<ServiceOptions['onCaptureProgress']>>[0],
  ): void {
    this.#options.onCaptureProgress?.(progress);
  }
}

export function createGuideShotService(
  options: ServiceOptions = {},
): GuideShotService {
  return new GuideShotService(options);
}

interface CaptureJobOptions {
  readonly job: PlannedJob;
  readonly config: GuideShotConfig;
  readonly baseUrl: URL;
  readonly fetch: typeof globalThis.fetch;
  readonly cache: SceneCache;
  readonly transaction: OutputTransaction;
  readonly driver: BrowserRun;
  readonly renderer: RendererRun;
  readonly signal?: AbortSignal;
}

async function captureJob(options: CaptureJobOptions): Promise<ComposedJob> {
  const resolved = await resolveJob(options.job, options.config, {
    baseUrl: options.baseUrl,
    fetch: options.fetch,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  });
  try {
    const captured = await options.driver.capture({
      job: resolved.capture,
      captureKey: options.job.captureKey,
    });
    assertSceneIdentity(captured.scene, options.job);
    const cached = await options.cache.write(captured);
    const composition = await composeJob(
      options.job,
      resolved.recipe,
      cached,
      options.renderer,
    );
    await options.transaction.stage(composition.staged);
    return {
      ...composition,
      report: { ...composition.report, status: 'captured' },
    };
  } finally {
    await runScenarioCleanup(resolved.cleanup, options.job);
  }
}

function captureConcurrency(
  config: GuideShotConfig,
  override: number | undefined,
): number {
  const concurrency = override ?? config.capture?.concurrency ?? 1;
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      'Capture concurrency must be a positive integer.',
    );
  }
  return concurrency;
}

function scenarioConcurrencyKey(
  job: PlannedJob,
  config: GuideShotConfig,
): string | undefined {
  const scenario = job.recipe.scenario?.use;
  return scenario === undefined
    ? undefined
    : config.scenarios?.[scenario]?.concurrencyKey;
}

async function runConcurrent<TItem, TResult>(
  items: readonly TItem[],
  concurrency: number,
  keyFor: (item: TItem) => string | undefined,
  run: (item: TItem) => Promise<TResult>,
): Promise<TResult[]> {
  const results = new Array<TResult>(items.length);
  const pending = items.map((_, index) => index);
  const activeKeys = new Set<string>();
  let active = 0;
  let failed = false;
  let failure: unknown;

  await new Promise<void>((resolve) => {
    const schedule = (): void => {
      if (failed) {
        if (active === 0) resolve();
        return;
      }
      while (active < concurrency && pending.length > 0) {
        const pendingIndex = pending.findIndex((index) => {
          const item = items[index];
          if (item === undefined) return false;
          const key = keyFor(item);
          return key === undefined || !activeKeys.has(key);
        });
        if (pendingIndex === -1) return;
        const index = pending.splice(pendingIndex, 1)[0];
        const item = index === undefined ? undefined : items[index];
        if (index === undefined || item === undefined) continue;
        const key = keyFor(item);
        active += 1;
        if (key !== undefined) activeKeys.add(key);
        void run(item)
          .then((result) => {
            results[index] = result;
          })
          .catch((error: unknown) => {
            if (!failed) {
              failed = true;
              failure = error;
            }
          })
          .finally(() => {
            active -= 1;
            if (key !== undefined) activeKeys.delete(key);
            if (active === 0 && (failed || pending.length === 0)) resolve();
            else schedule();
          });
      }
      if (active === 0 && pending.length === 0) resolve();
    };
    schedule();
  });

  if (failed) throw failure;
  return results;
}

async function composeJob(
  job: PlannedJob,
  recipe: Recipe,
  cached: CachedScene,
  renderer: RendererRun,
): Promise<ComposedJob> {
  const output = compositionOutput(recipe);
  const annotations = resolvedAnnotations(recipe);
  const alt = resolvedAlt(recipe);
  const compositionKey = createJobCompositionHash(job, cached.sceneHash);
  const rendered = await renderer.render({
    scene: cached.scene,
    background: cached.background,
    annotations,
    output,
    ...(cached.scene.theme === undefined ? {} : { theme: cached.scene.theme }),
  });
  if (rendered.length !== 1 || rendered[0] === undefined) {
    throw new GuideShotError(
      'COMPOSITION_FAILED',
      `Renderer must return exactly one Phase 1 asset for "${job.key}".`,
      { recipeId: job.recipeId, jobKey: job.key },
    );
  }
  const asset = verifyRenderedAsset(rendered[0]);
  if (asset.format !== output.formats[0]) {
    throw new GuideShotError(
      'COMPOSITION_FAILED',
      `Renderer returned unexpected format "${asset.format}" for "${job.key}".`,
      { recipeId: job.recipeId, jobKey: job.key },
    );
  }
  const src = createAssetPath(
    job.recipeId,
    job.variantKey,
    asset.hash,
    asset.format,
  );
  const manifest: ManifestAssetInput = {
    recipeId: job.recipeId,
    ...(recipe.title === undefined ? {} : { title: recipe.title }),
    variantKey: job.variantKey,
    src,
    width: asset.width,
    height: asset.height,
    format: asset.format,
    hash: asset.hash,
    alt,
  };
  return {
    staged: { manifest, bytes: asset.bytes },
    report: {
      key: job.key,
      recipeId: job.recipeId,
      variantKey: job.variantKey,
      captureKey: job.captureKey,
      compositionKey,
      status: 'composed',
      asset: {
        src,
        format: asset.format,
        hash: asset.hash,
        width: asset.width,
        height: asset.height,
      },
    },
  };
}

async function resolveCachedRecipe(
  job: PlannedJob,
  config: GuideShotConfig,
  cached: CachedScene,
): Promise<Recipe> {
  const interpolated = validateRecipe(
    interpolate(job.recipe, {
      scenario: cached.scene.safeVariables,
      variant: cached.scene.variants,
    }),
    job.recipeFile,
  );
  return validateRecipe(
    await resolveRecipeText(interpolated, config.translations, {
      locale: cached.scene.locale,
      variables: cached.scene.safeVariables,
      variants: cached.scene.variants,
    }),
    job.recipeFile,
  );
}

function compositionOutput(recipe: Recipe): CompositionOutput {
  const formats = recipe.output?.formats ?? ['webp'];
  if (formats.length !== 1 || formats[0] === undefined) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      `Recipe "${recipe.id}" must request exactly one Phase 1 output format.`,
      { recipeId: recipe.id },
    );
  }
  return {
    formats: [formats[0]],
    ...(recipe.output?.quality === undefined
      ? {}
      : { quality: recipe.output.quality }),
    ...(recipe.output?.width === undefined
      ? {}
      : { width: recipe.output.width }),
    ...(recipe.output?.height === undefined
      ? {}
      : { height: recipe.output.height }),
  };
}

function assertSceneIdentity(
  scene: { captureKey: string; recipeId: string; variantKey: string },
  job: PlannedJob,
): void {
  if (
    scene.captureKey !== job.captureKey ||
    scene.recipeId !== job.recipeId ||
    scene.variantKey !== job.variantKey
  ) {
    throw new GuideShotError(
      'CAPTURE_FAILED',
      `Driver returned a scene with the wrong identity for "${job.key}".`,
      { recipeId: job.recipeId, jobKey: job.key },
    );
  }
}

async function runScenarioCleanup(
  cleanup: (() => void | Promise<void>) | undefined,
  job: PlannedJob,
): Promise<void> {
  if (cleanup === undefined) return;
  try {
    await cleanup();
  } catch (cause) {
    throw new GuideShotError(
      'SCENARIO_FAILED',
      `Scenario cleanup failed for "${job.key}".`,
      { recipeId: job.recipeId, jobKey: job.key, cause },
    );
  }
}

async function closeRenderer(renderer?: RendererRun): Promise<void> {
  await renderer?.close();
}

async function closeDriver(driver?: BrowserRun): Promise<void> {
  await driver?.close();
}

function validateSelection(
  config: GuideShotConfig,
  selection: CommandSelection,
): void {
  for (const [name, value] of Object.entries(selection.dimensions ?? {})) {
    const dimension = config.dimensions?.[name];
    if (dimension === undefined) {
      throw new GuideShotError(
        'EXTENSION_NOT_REGISTERED',
        `Dimension filter references unknown dimension "${name}".`,
      );
    }
    if (!dimension.values.some((candidate) => Object.is(candidate, value))) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Dimension "${name}" does not allow filtered value "${String(value)}".`,
      );
    }
  }
}

export function resolveDimensionArguments(
  config: GuideShotConfig,
  arguments_: readonly string[],
): Readonly<Record<string, VariantValue>> {
  const result: Record<string, VariantValue> = {};
  for (const argument of arguments_) {
    const separator = argument.indexOf('=');
    if (separator <= 0 || separator === argument.length - 1) {
      throw new TypeError(
        `Dimension filter "${argument}" must use name=value syntax.`,
      );
    }
    const name = argument.slice(0, separator);
    const raw = argument.slice(separator + 1);
    const dimension = config.dimensions?.[name];
    if (dimension === undefined) {
      throw new GuideShotError(
        'EXTENSION_NOT_REGISTERED',
        `Dimension filter references unknown dimension "${name}".`,
      );
    }
    const matches = dimension.values.filter((value) => String(value) === raw);
    if (matches.length !== 1 || matches[0] === undefined) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Dimension filter "${argument}" does not identify one allowed value.`,
      );
    }
    const previous = result[name];
    if (previous !== undefined && !Object.is(previous, matches[0])) {
      throw new TypeError(`Dimension "${name}" was filtered more than once.`);
    }
    result[name] = matches[0];
  }
  return result;
}

function mergeDimensions(
  typed: Readonly<Record<string, VariantValue>> | undefined,
  raw: Readonly<Record<string, VariantValue>>,
): Readonly<Record<string, VariantValue>> {
  const result: Record<string, VariantValue> = { ...typed };
  for (const [name, value] of Object.entries(raw)) {
    const previous = result[name];
    if (previous !== undefined && !Object.is(previous, value)) {
      throw new TypeError(`Dimension "${name}" was filtered more than once.`);
    }
    result[name] = value;
  }
  return result;
}

function manifestReplacementScope(
  plan: Plan,
  selection: CommandOptions,
): ManifestReplacementScope {
  const hasDimensionFilter =
    Object.keys(selection.dimensions ?? {}).length > 0 ||
    (selection.dimensionArguments?.length ?? 0) > 0;
  if (hasDimensionFilter) {
    return {
      mode: 'variants',
      jobKeys: new Set(
        plan.jobs.map((job) => jobIdentity(job.recipeId, job.variantKey)),
      ),
    };
  }

  if (selection.ids !== undefined || selection.tags !== undefined) {
    return {
      mode: 'recipes',
      recipeIds: new Set(
        plan.recipes
          .filter(
            ({ recipe }) =>
              (selection.ids === undefined ||
                selection.ids.includes(recipe.id)) &&
              (selection.tags === undefined ||
                selection.tags.every(
                  (tag) => recipe.tags?.includes(tag) === true,
                )),
          )
          .map(({ recipe }) => recipe.id),
      ),
    };
  }

  return { mode: 'all' };
}

function plannedReports(plan: Plan): JobReport[] {
  return plan.jobs.map((job) => ({
    key: job.key,
    recipeId: job.recipeId,
    variantKey: job.variantKey,
    captureKey: job.captureKey,
    status: 'planned',
  }));
}

function successReport(
  command: CommandName,
  plan: Plan,
  jobs: readonly JobReport[],
  assets?: number,
  outputs?: readonly string[],
): CommandReport {
  const recipes = new Set(plan.jobs.map((job) => job.recipeId)).size;
  return {
    version: 1,
    command,
    ok: true,
    summary: {
      recipes,
      jobs: jobs.length,
      ...(assets === undefined ? {} : { assets }),
    },
    jobs,
    diagnostics: [],
    ...(outputs === undefined ? {} : { outputs }),
  };
}

function requireJobs(plan: Plan, command: CommandName): void {
  if (plan.jobs.length === 0) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      `No jobs matched the filters for guideshot ${command}.`,
    );
  }
}

function fallbackCode(command: CommandName) {
  if (command === 'capture') return 'CAPTURE_FAILED' as const;
  if (command === 'compose') return 'COMPOSITION_FAILED' as const;
  if (command === 'verify') return 'MANIFEST_INVALID' as const;
  return 'RECIPE_SCHEMA_INVALID' as const;
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareStrings);
}

function relativePath(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}

async function writeAtomic(file: string, contents: string): Promise<void> {
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporary, contents, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted !== true) return;
  throw new GuideShotError(
    'CAPTURE_FAILED',
    'GuideShot operation was cancelled.',
    {
      cause: signal.reason,
    },
  );
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

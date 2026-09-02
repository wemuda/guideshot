import type {
  Action,
  Annotation,
  Expectation,
  JsonObject,
  JsonValue,
  Recipe,
  VariantValue,
} from '@guideshot/schema';

export interface ExtensionInfo {
  name: string;
  version: string;
  apiVersion?: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface CaptureProfile {
  viewport: Viewport;
  pixelRatio?: number;
  locale?: string;
  timezoneId?: string;
  colorScheme?: 'light' | 'dark';
  reducedMotion?: 'reduce' | 'no-preference';
}

export interface BrowserCookie {
  name: string;
  value: string;
  url?: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface LocalStorageState {
  origin: string;
  values: Record<string, string>;
}

export interface BrowserStatePatch {
  locale?: string;
  timezoneId?: string;
  colorScheme?: 'light' | 'dark';
  reducedMotion?: 'reduce' | 'no-preference';
  cookies?: readonly BrowserCookie[];
  localStorage?: readonly LocalStorageState[];
  extraHTTPHeaders?: Readonly<Record<string, string>>;
}

export interface DimensionResolveContext {
  dimension: string;
  variants: Readonly<Record<string, VariantValue>>;
  signal?: AbortSignal;
}

export interface DimensionDefinition<
  TValue extends VariantValue = VariantValue,
> extends ExtensionInfo {
  values: readonly TValue[];
  resolve(
    value: TValue,
    context: DimensionResolveContext,
  ): BrowserStatePatch | Promise<BrowserStatePatch>;
}

export interface ScenarioContext {
  baseUrl: URL;
  recipeId: string;
  variantKey: string;
  variants: Readonly<Record<string, VariantValue>>;
  fetch: typeof globalThis.fetch;
  signal?: AbortSignal;
}

export interface ScenarioResult {
  variables?: JsonObject;
  browser?: BrowserStatePatch;
  cleanup?: () => void | Promise<void>;
}

export interface ScenarioDefinition<
  TInput extends JsonObject = JsonObject,
> extends ExtensionInfo {
  schema: object;
  datasetRevision?: string;
  concurrencyKey?: string;
  prepare(
    context: ScenarioContext,
    input: TInput,
  ): ScenarioResult | Promise<ScenarioResult>;
}

export interface TranslationContext {
  locale: string;
  args: Readonly<Record<string, JsonValue>>;
  variables: Readonly<JsonObject>;
}

export interface TranslationProvider extends ExtensionInfo {
  resolve(
    message: string,
    context: TranslationContext,
  ): string | Promise<string>;
}

export interface ServerConfig {
  url: string;
  command?: string;
  timeoutMs?: number;
}

export interface SafetyConfig {
  allowedOrigins?: readonly string[];
}

export interface CaptureConfig {
  concurrency?: number;
}

export interface GuideShotConfig {
  recipes: readonly string[];
  outputDir: string;
  cacheDir: string;
  server: ServerConfig;
  capture?: CaptureConfig;
  safety?: SafetyConfig;
  targetAttribute?: `data-${string}`;
  profiles: Readonly<Record<string, CaptureProfile>>;
  dimensions?: Readonly<Record<string, DimensionDefinition>>;
  scenarios?: Readonly<Record<string, ScenarioDefinition>>;
  translations?: TranslationProvider;
  driver: BrowserDriver;
  renderer: AnnotationRenderer;
}

export interface BrowserEnvironment {
  driver: string;
  driverVersion: string;
  browser: string;
  browserVersion: string;
  platform?: string;
}

export interface DriverRunOptions {
  baseUrl: URL;
  targetAttribute: `data-${string}`;
  signal?: AbortSignal;
}

export interface ResolvedCaptureJob {
  key: string;
  recipeId: string;
  variantKey: string;
  variants: Readonly<Record<string, VariantValue>>;
  profile: CaptureProfile;
  page: { path: string };
  prepare: readonly Action[];
  ready: readonly Expectation[];
  capture: NonNullable<Recipe['capture']> | Record<string, never>;
  browser: BrowserStatePatch;
  safeVariables: JsonObject;
}

export interface CaptureRequest {
  job: ResolvedCaptureJob;
  captureKey: string;
}

export interface BrowserDriver extends ExtensionInfo {
  describeEnvironment(): Promise<BrowserEnvironment>;
  open(options: DriverRunOptions): Promise<BrowserRun>;
}

export interface BrowserRun {
  capture(request: CaptureRequest): Promise<CaptureResult>;
  close(): Promise<void>;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneTarget {
  rect: Rect;
  visible: boolean;
  borderRadius?: number;
}

export interface SceneViewport extends Viewport {
  pixelRatio: number;
  scrollX: number;
  scrollY: number;
}

export interface SceneBackground {
  /**
   * The image is already cropped to `frame`. Its dimensions are physical
   * pixels; frame and target geometry use CSS pixels.
   */
  file: string;
  width: number;
  height: number;
  format: 'png';
  sha256: string;
}

export interface CapturedScene {
  version: 1;
  captureKey: string;
  recipeId: string;
  variantKey: string;
  variants: Readonly<Record<string, VariantValue>>;
  frame: Rect;
  viewport: SceneViewport;
  targets: Readonly<Record<string, SceneTarget>>;
  locale: string;
  direction: 'ltr' | 'rtl';
  theme?: string;
  safeVariables: JsonObject;
  background: SceneBackground;
  environment: BrowserEnvironment;
  sanitized: true;
}

export interface CaptureResult {
  scene: CapturedScene;
  background: Uint8Array;
}

export interface ResolvedAnnotation {
  definition: Annotation;
  text?: string;
}

export type OutputFormat = 'png' | 'webp';

export interface CompositionOutput {
  formats: readonly OutputFormat[];
  quality?: number;
  width?: number;
  height?: number;
}

export interface CompositionRequest {
  scene: CapturedScene;
  background: Uint8Array;
  annotations: readonly ResolvedAnnotation[];
  output: CompositionOutput;
  theme?: string;
}

export interface RenderedAsset {
  format: OutputFormat;
  mimeType: 'image/png' | 'image/webp';
  bytes: Uint8Array;
  width: number;
  height: number;
}

export interface AnnotationRenderer extends ExtensionInfo {
  open(): Promise<RendererRun>;
}

export interface RendererRun {
  render(request: CompositionRequest): Promise<readonly RenderedAsset[]>;
  close(): Promise<void>;
}

export interface MatrixDefinition {
  dimensions: Readonly<Record<string, readonly VariantValue[]>>;
  include?: readonly Readonly<Record<string, VariantValue>>[];
  exclude?: readonly Readonly<Record<string, VariantValue>>[];
}

export interface VariantRow {
  key: string;
  values: Readonly<Record<string, VariantValue>>;
}

export interface CaptureIntent {
  recipeId: string;
  profile: string;
  serverUrl: string;
  targetAttribute: `data-${string}`;
  variants: Readonly<Record<string, VariantValue>>;
  page: Recipe['page'];
  scenario?: Recipe['scenario'];
  prepare?: Recipe['prepare'];
  ready?: Recipe['ready'];
  capture?: Recipe['capture'];
  profileConfig: CaptureProfile;
  scenarioVersion?: string;
  datasetRevision?: string;
  dimensionVersions: Readonly<Record<string, string>>;
  driver: Pick<BrowserDriver, 'name' | 'version'>;
  translationVersion?: string;
}

export interface CompositionIntent {
  sceneHash: string;
  annotations?: Recipe['annotations'];
  accessibility: Recipe['accessibility'];
  output?: Recipe['output'];
  renderer: Pick<AnnotationRenderer, 'name' | 'version'>;
  translationVersion?: string;
}

export interface PlannedJob {
  key: string;
  recipeId: string;
  recipeFile: string;
  profile: string;
  variantKey: string;
  variants: Readonly<Record<string, VariantValue>>;
  captureKey: string;
  captureIntent: CaptureIntent;
  compositionIntent: Omit<CompositionIntent, 'sceneHash'>;
  recipe: Recipe;
}

export interface RecipeSource {
  file: string;
  recipe: Recipe;
}

export interface Plan {
  jobs: readonly PlannedJob[];
  recipes: readonly RecipeSource[];
}

export function defineConfig<const TConfig extends GuideShotConfig>(
  config: TConfig,
): TConfig {
  return config;
}

export function defineDimension<
  const TValue extends VariantValue,
  const TDefinition extends DimensionDefinition<TValue>,
>(definition: TDefinition): TDefinition {
  return definition;
}

export function defineScenario<
  const TInput extends JsonObject,
  const TDefinition extends ScenarioDefinition<TInput>,
>(definition: TDefinition): TDefinition {
  return definition;
}

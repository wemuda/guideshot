export {
  SCHEMA_VERSION,
  PublicManifestSchema,
  RecipeSchema,
} from '@guideshot/schema';
export type {
  Accessibility,
  Action,
  Annotation,
  AnnotationPlacement,
  Expectation,
  Frame,
  JsonObject,
  JsonValue,
  LocalizedText,
  ManifestEntry,
  ManifestVariant,
  Matrix,
  Output,
  OutputFormat,
  PublicManifest,
  Recipe,
  VariantValue,
} from '@guideshot/schema';

export {
  canonicalSerialize,
  createCaptureHash,
  createCompositionHash,
  hashCanonical,
  sha256,
} from './canonical.js';
export { defineConfig, defineDimension, defineScenario } from './contracts.js';
export type {
  AnnotationRenderer,
  BrowserCookie,
  BrowserDriver,
  BrowserEnvironment,
  BrowserRun,
  BrowserStatePatch,
  CaptureIntent,
  CaptureProfile,
  CaptureRequest,
  CaptureResult,
  CapturedScene,
  CompositionIntent,
  CompositionOutput,
  CompositionRequest,
  DimensionDefinition,
  DimensionResolveContext,
  DriverRunOptions,
  ExtensionInfo,
  GuideShotConfig,
  LocalStorageState,
  MatrixDefinition,
  Plan,
  PlannedJob,
  RecipeSource,
  Rect,
  RenderedAsset,
  RendererRun,
  ResolvedAnnotation,
  ResolvedCaptureJob,
  SafetyConfig,
  ScenarioContext,
  ScenarioDefinition,
  ScenarioResult,
  SceneBackground,
  SceneTarget,
  SceneViewport,
  ServerConfig,
  TranslationContext,
  TranslationProvider,
  VariantRow,
  Viewport,
} from './contracts.js';
export {
  DIAGNOSTIC_CODES,
  GuideShotError,
  diagnosticFromUnknown,
  isGuideShotError,
} from './diagnostics.js';
export type {
  Diagnostic,
  DiagnosticCode,
  DiagnosticLocation,
  DiagnosticSeverity,
  GuideShotErrorOptions,
} from './diagnostics.js';
export { assertUniqueRecipeIds, discoverRecipes } from './discovery.js';
export { interpolate, interpolateString } from './interpolate.js';
export type { InterpolationContext } from './interpolate.js';
export { buildPublicManifest, createAssetPath } from './manifest.js';
export type { ManifestAssetInput } from './manifest.js';
export {
  createVariantKey,
  expandMatrix,
  matchesVariantFilter,
} from './matrix.js';
export {
  createJobCompositionHash,
  planProject,
  planRecipes,
} from './planner.js';
export type { PlanOptions } from './planner.js';
export { mergeBrowserState, resolveJob } from './resolution.js';
export type { ResolveJobOptions, ResolvedJob } from './resolution.js';
export {
  assertAllowedOrigin,
  resolveArtifactPath,
  resolvePageUrl,
  resolveSafeProjectPaths,
  sanitizeFileSegment,
} from './safety.js';
export type { SafeProjectPaths } from './safety.js';
export {
  resolveLocalizedText,
  resolveRecipeText,
  resolvedAlt,
  resolvedAnnotations,
} from './text.js';
export type { ResolveTextContext } from './text.js';
export {
  defaultProfileName,
  parseRecipe,
  validateConfig,
  validateManifest,
  validateRecipe,
  validateRecipeSemantics,
} from './validation.js';
export type { ParseRecipeOptions } from './validation.js';

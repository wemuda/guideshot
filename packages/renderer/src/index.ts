export { normalizeAnnotation, normalizeAnnotations } from './annotations.js';
export type {
  NormalizedAnnotation,
  NormalizedArrow,
  NormalizedCallout,
  NormalizedLabel,
  NormalizedMarker,
  NormalizedOutline,
  NormalizedPlacement,
  NormalizedRedaction,
  NormalizedSpotlight,
  SupportedAnnotationKind,
} from './annotations.js';
export type {
  AnnotationRenderer,
  CapturedScene,
  CompositionRequest,
  Rect,
  RenderedAsset,
  RendererRun,
  ResolvedAnnotation,
  SceneTarget,
} from './contracts.js';
export {
  buildMeasurementHtml,
  createCompositionHtml,
  escapeHtml,
  layoutAnnotations,
  mimeTypeFor,
  normalizeFormats,
  resolveOutputSize,
} from './document.js';
export type {
  AnnotationLayout,
  CompositionDocumentInput,
  MeasuredBox,
  OutputFormat,
  OutputSize,
} from './document.js';
export {
  AnnotationPlacementError,
  compareIds,
  connectorPoints,
  isInsideBounds,
  placeAnnotations,
  placementCandidates,
  rectsOverlap,
  standaloneArrowPoints,
} from './placement.js';
export type {
  PlacedAnnotation,
  PlacementAlign,
  PlacementBounds,
  PlacementOptions,
  PlacementRequest,
  PlacementSide,
  Point,
  Size,
} from './placement.js';
export { htmlRenderer } from './renderer.js';
export type { HtmlRendererOptions } from './renderer.js';
export { resolveTheme } from './theme.js';
export type { AnnotationTheme, ThemeMode } from './theme.js';

import { Buffer } from 'node:buffer';

import { GuideShotError } from '@guideshot/core';

import type { CapturedScene, CompositionRequest, Rect } from './contracts.js';
import type {
  NormalizedAnnotation,
  NormalizedArrow,
  NormalizedCallout,
  NormalizedLabel,
  NormalizedMarker,
} from './annotations.js';
import {
  connectorPoints,
  placeAnnotations,
  standaloneArrowPoints,
  type PlacedAnnotation,
  type PlacementRequest,
  type PlacementSide,
  type Point,
  type Size,
} from './placement.js';
import type { AnnotationTheme } from './theme.js';

export type OutputFormat = 'png' | 'webp';

export interface OutputSize {
  readonly width: number;
  readonly height: number;
}

export interface MeasuredBox extends Size {
  readonly id: string;
}

export interface AnnotationLayout {
  readonly placements: readonly PlacedAnnotation[];
  readonly arrows: readonly {
    id: string;
    start: Point;
    end: Point;
  }[];
}

export interface CompositionDocumentInput {
  readonly scene: CapturedScene;
  readonly background: Uint8Array;
  readonly annotations: readonly NormalizedAnnotation[];
  readonly measurements: ReadonlyMap<string, Size>;
  readonly layout: AnnotationLayout;
  readonly outputSize: OutputSize;
  readonly theme: AnnotationTheme;
  readonly font: Uint8Array;
}

const TEXT_BOX_KINDS = new Set<NormalizedAnnotation['kind']>([
  'callout',
  'label',
  'marker',
]);
type TextBoxAnnotation = NormalizedCallout | NormalizedLabel | NormalizedMarker;

export function resolveOutputSize(
  scene: CapturedScene,
  output: CompositionRequest['output'],
): OutputSize {
  const frameWidth = scene.frame.width;
  const frameHeight = scene.frame.height;
  assertPositive(frameWidth, 'scene.frame.width');
  assertPositive(frameHeight, 'scene.frame.height');

  const requestedWidth = output.width;
  const requestedHeight = output.height;
  const density = scene.viewport.pixelRatio;
  assertPositive(density, 'scene.viewport.pixelRatio');

  if (requestedWidth !== undefined && requestedHeight !== undefined) {
    const width = checkedDimension(requestedWidth, 'output.width');
    const height = checkedDimension(requestedHeight, 'output.height');
    const derivedHeight = Math.round((width * frameHeight) / frameWidth);
    if (Math.abs(derivedHeight - height) > 1) {
      throw new RangeError(
        `Output dimensions ${width}x${height} do not preserve the captured frame aspect ratio.`,
      );
    }
  }

  const width =
    requestedWidth !== undefined
      ? checkedDimension(requestedWidth, 'output.width')
      : requestedHeight !== undefined
        ? Math.round(
            (checkedDimension(requestedHeight, 'output.height') * frameWidth) /
              frameHeight,
          )
        : Math.round(frameWidth * density);
  const height =
    requestedHeight !== undefined
      ? checkedDimension(requestedHeight, 'output.height')
      : requestedWidth !== undefined
        ? Math.round(
            (checkedDimension(requestedWidth, 'output.width') * frameHeight) /
              frameWidth,
          )
        : Math.round(frameHeight * density);

  return {
    width: checkedDimension(width, 'resolved output width'),
    height: checkedDimension(height, 'resolved output height'),
  };
}

export function normalizeFormats(
  formats: readonly OutputFormat[],
): readonly OutputFormat[] {
  const unique = new Set(formats);
  if (unique.size === 0)
    throw new TypeError('At least one output format is required.');
  for (const format of unique) {
    if (format !== 'png' && format !== 'webp') {
      throw new TypeError(`Unsupported output format "${String(format)}".`);
    }
  }
  return [...unique].sort((left, right) =>
    left === right ? 0 : left === 'png' ? -1 : 1,
  );
}

export function mimeTypeFor(format: OutputFormat): 'image/png' | 'image/webp' {
  return format === 'png' ? 'image/png' : 'image/webp';
}

export function buildMeasurementHtml(input: {
  readonly annotations: readonly NormalizedAnnotation[];
  readonly frameWidth: number;
  readonly theme: AnnotationTheme;
  readonly font: Uint8Array;
}): string {
  const maxWidth = Math.max(80, Math.min(280, input.frameWidth - 32));
  const boxes = [...input.annotations]
    .filter(isTextBoxAnnotation)
    .sort(compareAnnotationIds)
    .map((annotation) => measurementElement(annotation))
    .join('');

  return htmlShell(
    input.font,
    input.theme,
    `body{padding:0;margin:0}.measure-root{position:absolute;left:0;top:0;width:${cssNumber(maxWidth)}px}` +
      sharedBoxCss(maxWidth) +
      '.measure{position:relative!important;inset:auto!important;display:table;margin:0 0 8px 0}',
    `<main class="measure-root">${boxes}</main>`,
  );
}

export function layoutAnnotations(input: {
  readonly scene: CapturedScene;
  readonly annotations: readonly NormalizedAnnotation[];
  readonly measurements: ReadonlyMap<string, Size>;
}): AnnotationLayout {
  const sorted = [...input.annotations].sort(compareAnnotationIds);
  const targetEntries = sorted.map((annotation) => ({
    annotation,
    target: resolveTarget(input.scene, annotation.id, annotation.target),
  }));
  const boxRequests: PlacementRequest[] = [];

  for (const { annotation, target } of targetEntries) {
    if (!TEXT_BOX_KINDS.has(annotation.kind)) continue;
    const size = input.measurements.get(annotation.id);
    if (!size)
      throw new TypeError(
        `Missing measured size for annotation "${annotation.id}".`,
      );
    const box = annotation as
      NormalizedCallout | NormalizedLabel | NormalizedMarker;
    const request: PlacementRequest = {
      id: box.id,
      target: target.rect,
      size,
      side: box.placement.side,
      offset: box.placement.offset,
      nudge: box.placement.nudge,
    };
    boxRequests.push(
      box.placement.align
        ? { ...request, align: box.placement.align }
        : request,
    );
  }

  const placements = placeAnnotations(
    boxRequests,
    { width: input.scene.frame.width, height: input.scene.frame.height },
    {
      direction: input.scene.direction,
      obstacles: targetEntries.map(({ target }) => target.rect),
    },
  );
  const placementsById = new Map(
    placements.map((placement) => [placement.id, placement]),
  );
  const arrows: { id: string; start: Point; end: Point }[] = [];

  for (const { annotation, target } of targetEntries) {
    if (annotation.kind === 'callout' && annotation.connector) {
      const placement = placementsById.get(annotation.id);
      if (!placement)
        throw new TypeError(
          `Missing placement for annotation "${annotation.id}".`,
        );
      const connectorTarget =
        annotation.connectorAnchor === 'edge' && annotation.emphasis
          ? paddedRect(target.rect, annotation.padding)
          : target.rect;
      const points = connectorPoints(placement, connectorTarget);
      arrows.push({
        id: annotation.id,
        start: points.start,
        end:
          annotation.connectorAnchor === 'center'
            ? {
                x: target.rect.x + target.rect.width / 2,
                y: target.rect.y + target.rect.height / 2,
              }
            : points.end,
      });
    } else if (annotation.kind === 'arrow') {
      const side = resolveArrowSide(annotation, target.rect, input.scene);
      const points = standaloneArrowPoints(
        target.rect,
        side,
        annotation.placement.offset,
        34,
        annotation.placement.nudge,
      );
      arrows.push({ id: annotation.id, ...points });
    }
  }

  return {
    placements,
    arrows: arrows.sort((left, right) => compareText(left.id, right.id)),
  };
}

export function createCompositionHtml(input: CompositionDocumentInput): string {
  const { scene, outputSize, theme } = input;
  const scaleX = outputSize.width / scene.frame.width;
  const scaleY = outputSize.height / scene.frame.height;
  const maxWidth = Math.max(80, Math.min(280, scene.frame.width - 32));
  const placements = new Map(
    input.layout.placements.map((placement) => [placement.id, placement]),
  );
  const sorted = [...input.annotations].sort(compareAnnotationIds);

  const spotlights = sorted.flatMap((annotation) => {
    if (
      annotation.kind !== 'spotlight' &&
      !(annotation.kind === 'callout' && annotation.emphasis === 'spotlight')
    ) {
      return [];
    }
    const target = resolveTarget(scene, annotation.id, annotation.target);
    return [highlightShape(target, annotation.padding, 8)];
  });
  const outlines = sorted.flatMap((annotation) => {
    if (
      annotation.kind !== 'outline' &&
      !(annotation.kind === 'callout' && annotation.emphasis === 'outline')
    ) {
      return [];
    }
    const target = resolveTarget(scene, annotation.id, annotation.target);
    return [highlightShape(target, annotation.padding, 8)];
  });
  const redactions = sorted
    .filter((annotation) => annotation.kind === 'redaction')
    .map((annotation) => {
      const target = resolveTarget(scene, annotation.id, annotation.target);
      return highlightShape(target, annotation.padding, 4);
    });

  const svg = svgOverlay({
    width: scene.frame.width,
    height: scene.frame.height,
    spotlights,
    outlines,
    redactions,
    arrows: input.layout.arrows,
    theme,
  });
  const boxes = sorted
    .filter(isTextBoxAnnotation)
    .map((annotation) => {
      const placement = placements.get(annotation.id);
      if (!placement)
        throw new TypeError(
          `Missing placement for annotation "${annotation.id}".`,
        );
      return positionedBox(annotation, placement);
    })
    .join('');
  const background = Buffer.from(input.background).toString('base64');
  const content =
    `<main id="viewport" aria-hidden="true">` +
    `<section id="scene">` +
    `<img class="background" alt="" src="data:image/png;base64,${background}">` +
    svg +
    boxes +
    `</section>` +
    `</main>`;

  const layoutCss =
    `html,body{width:${outputSize.width}px;height:${outputSize.height}px;overflow:hidden}` +
    `#viewport{position:relative;width:${outputSize.width}px;height:${outputSize.height}px;overflow:hidden}` +
    `#scene{position:absolute;left:0;top:0;width:${cssNumber(scene.frame.width)}px;height:${cssNumber(scene.frame.height)}px;` +
    `transform:scale(${cssNumber(scaleX)},${cssNumber(scaleY)});transform-origin:0 0;overflow:hidden}` +
    `.background{position:absolute;inset:0;width:${cssNumber(scene.frame.width)}px;height:${cssNumber(scene.frame.height)}px;display:block}` +
    `.overlay{position:absolute;inset:0;width:100%;height:100%;overflow:visible}` +
    sharedBoxCss(maxWidth) +
    `.box{position:absolute;box-sizing:border-box}`;

  return htmlShell(
    input.font,
    theme,
    layoutCss,
    content,
    scene.locale,
    scene.direction,
  );
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  );
}

function measurementElement(
  annotation: NormalizedCallout | NormalizedLabel | NormalizedMarker,
): string {
  return `<div class="measure box ${annotation.kind}" data-measure-id="${escapeHtml(annotation.id)}">${escapeHtml(annotation.text)}</div>`;
}

function positionedBox(
  annotation: NormalizedCallout | NormalizedLabel | NormalizedMarker,
  placement: PlacedAnnotation,
): string {
  const rect = placement.rect;
  const style = `left:${cssNumber(rect.x)}px;top:${cssNumber(rect.y)}px;width:${cssNumber(rect.width)}px;height:${cssNumber(rect.height)}px`;
  return `<div class="box ${annotation.kind}" data-annotation-id="${escapeHtml(annotation.id)}" style="${style}">${escapeHtml(annotation.text)}</div>`;
}

function svgOverlay(input: {
  readonly width: number;
  readonly height: number;
  readonly spotlights: readonly {
    readonly rect: Rect;
    readonly radius: number;
  }[];
  readonly outlines: readonly {
    readonly rect: Rect;
    readonly radius: number;
  }[];
  readonly redactions: readonly {
    readonly rect: Rect;
    readonly radius: number;
  }[];
  readonly arrows: AnnotationLayout['arrows'];
  readonly theme: AnnotationTheme;
}): string {
  const spotlightMask =
    input.spotlights.length === 0
      ? ''
      : `<mask id="guideshot-spotlight-mask"><rect width="100%" height="100%" fill="white"/>${input.spotlights
          .map(
            ({ rect, radius }) =>
              `<rect x="${svgNumber(rect.x)}" y="${svgNumber(rect.y)}" width="${svgNumber(rect.width)}" height="${svgNumber(rect.height)}" rx="${svgNumber(radius)}" fill="black"/>`,
          )
          .join('')}</mask>`;
  const scrim =
    input.spotlights.length === 0
      ? ''
      : `<rect width="100%" height="100%" fill="${input.theme.scrim}" mask="url(#guideshot-spotlight-mask)"/>`;
  const redactions = input.redactions
    .map(
      ({ rect, radius }) =>
        `<rect data-kind="redaction" x="${svgNumber(rect.x)}" y="${svgNumber(rect.y)}" width="${svgNumber(rect.width)}" height="${svgNumber(rect.height)}" rx="${svgNumber(radius)}" fill="${input.theme.redaction}"/>`,
    )
    .join('');
  const outlines = input.outlines
    .map(
      ({ rect, radius }) =>
        `<rect data-kind="outline" x="${svgNumber(rect.x)}" y="${svgNumber(rect.y)}" width="${svgNumber(rect.width)}" height="${svgNumber(rect.height)}" rx="${svgNumber(radius)}" fill="none" stroke="${input.theme.accent}" stroke-width="2"/>`,
    )
    .join('');
  const arrows = input.arrows
    .map(
      ({ id, start, end }) =>
        `<path data-annotation-id="${escapeHtml(id)}" d="M ${svgNumber(start.x)} ${svgNumber(start.y)} L ${svgNumber(end.x)} ${svgNumber(end.y)}" fill="none" stroke="${input.theme.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#guideshot-arrowhead)"/>`,
    )
    .join('');

  return (
    `<svg class="overlay" viewBox="0 0 ${svgNumber(input.width)} ${svgNumber(input.height)}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>` +
    spotlightMask +
    `<marker id="guideshot-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L7,4 L1,7" fill="none" stroke="${input.theme.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>` +
    `</defs>` +
    scrim +
    redactions +
    outlines +
    arrows +
    `</svg>`
  );
}

function sharedBoxCss(maxWidth: number): string {
  return (
    `.callout,.label,.marker{font-family:var(--guideshot-font);overflow-wrap:anywhere}` +
    `.callout{max-width:${cssNumber(maxWidth)}px;padding:10px 14px;border-radius:10px;background:var(--guideshot-surface);` +
    `border:1px solid var(--guideshot-border);box-shadow:var(--guideshot-shadow);color:var(--guideshot-foreground);font-size:15px;font-weight:600;line-height:1.4}` +
    `.label{max-width:${cssNumber(maxWidth)}px;padding:7px 10px;border-radius:8px;background:var(--guideshot-surface);` +
    `border:1px solid var(--guideshot-border);box-shadow:var(--guideshot-shadow);color:var(--guideshot-foreground);font-size:13px;font-weight:600;line-height:1.35}` +
    `.marker{display:grid!important;place-items:center;width:28px!important;height:28px!important;padding:0;border-radius:999px;` +
    `background:var(--guideshot-accent);color:var(--guideshot-accent-contrast);font-size:13px;font-weight:700;line-height:1}`
  );
}

function htmlShell(
  font: Uint8Array,
  theme: AnnotationTheme,
  css: string,
  body: string,
  locale = 'en',
  direction: 'ltr' | 'rtl' = 'ltr',
): string {
  const fontData = Buffer.from(font).toString('base64');
  return (
    '<!doctype html>' +
    `<html lang="${escapeHtml(locale)}" dir="${direction}">` +
    '<head>' +
    '<meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'">` +
    '<style>' +
    `@font-face{font-family:"GuideShot Inter";src:url(data:font/woff2;base64,${fontData}) format("woff2");font-style:normal;font-weight:100 900;font-display:block}` +
    `:root{--guideshot-font:${theme.fontFamily};--guideshot-foreground:${theme.foreground};--guideshot-surface:${theme.surface};` +
    `--guideshot-border:${theme.surfaceBorder};--guideshot-accent:${theme.accent};--guideshot-accent-contrast:${theme.accentContrast};` +
    `--guideshot-shadow:${theme.shadow}}` +
    '*{box-sizing:border-box}html,body{margin:0;padding:0;background:transparent;color-scheme:' +
    theme.mode +
    ';font-family:var(--guideshot-font);text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased}' +
    css +
    '</style>' +
    '</head>' +
    `<body>${body}</body>` +
    '</html>'
  );
}

function resolveTarget(
  scene: CapturedScene,
  annotationId: string,
  targetId: string,
) {
  const target = scene.targets[targetId];
  if (!target) {
    throw new GuideShotError(
      'TARGET_NOT_FOUND',
      `Annotation "${annotationId}" references missing target "${targetId}".`,
      targetErrorOptions(scene, annotationId, targetId),
    );
  }
  if (!target.visible) {
    throw new GuideShotError(
      'TARGET_NOT_VISIBLE',
      `Annotation "${annotationId}" references hidden target "${targetId}".`,
      targetErrorOptions(scene, annotationId, targetId),
    );
  }
  return target;
}

function targetErrorOptions(
  scene: CapturedScene,
  annotationId: string,
  target: string,
) {
  return {
    recipeId: scene.recipeId,
    jobKey: `${scene.recipeId}::${scene.variantKey}`,
    details: { annotationId, target },
  } as const;
}

function resolveArrowSide(
  annotation: NormalizedArrow,
  target: Rect,
  scene: CapturedScene,
): PlacementSide {
  if (annotation.placement.side !== 'auto') return annotation.placement.side;
  const candidates: readonly PlacementSide[] =
    scene.direction === 'rtl'
      ? ['left', 'right', 'bottom', 'top']
      : ['right', 'left', 'bottom', 'top'];
  return (
    candidates.find((side) => {
      const { start, end } = standaloneArrowPoints(
        target,
        side,
        annotation.placement.offset,
        34,
        annotation.placement.nudge,
      );
      return pointsInside([start, end], scene.frame.width, scene.frame.height);
    }) ?? (scene.direction === 'rtl' ? 'left' : 'right')
  );
}

function isTextBoxAnnotation(
  annotation: NormalizedAnnotation,
): annotation is TextBoxAnnotation {
  return TEXT_BOX_KINDS.has(annotation.kind);
}

function pointsInside(
  points: readonly Point[],
  width: number,
  height: number,
): boolean {
  return points.every(
    (point) =>
      point.x >= 0 && point.y >= 0 && point.x <= width && point.y <= height,
  );
}

function paddedRect(rect: Rect, padding: number): Rect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function highlightShape(
  target: { readonly rect: Rect; readonly borderRadius?: number },
  padding: number,
  fallbackRadius: number,
): { readonly rect: Rect; readonly radius: number } {
  const rect = paddedRect(target.rect, padding);
  const outerRadius = (target.borderRadius ?? fallbackRadius) + padding;
  return {
    rect,
    radius: Math.min(outerRadius, rect.width / 2, rect.height / 2),
  };
}

function compareAnnotationIds(
  left: NormalizedAnnotation,
  right: NormalizedAnnotation,
): number {
  return compareText(left.id, right.id);
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function checkedDimension(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0 || value > 16_384) {
    throw new RangeError(`${label} must be an integer from 1 through 16384.`);
  }
  return value;
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
}

function cssNumber(value: number): string {
  if (!Number.isFinite(value))
    throw new RangeError('CSS number must be finite.');
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function svgNumber(value: number): string {
  return cssNumber(value);
}

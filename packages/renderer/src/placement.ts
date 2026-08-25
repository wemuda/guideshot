import type { Rect } from './contracts.js';

export type PlacementSide = 'top' | 'right' | 'bottom' | 'left';
export type PlacementAlign = 'start' | 'center' | 'end';

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PlacementBounds {
  readonly width: number;
  readonly height: number;
  readonly safeArea?: number;
}

export interface PlacementRequest {
  readonly id: string;
  readonly target: Rect;
  readonly size: Size;
  readonly side?: PlacementSide | 'auto';
  readonly align?: PlacementAlign;
  readonly offset?: number;
  readonly nudge?: Point;
}

export interface PlacementOptions {
  readonly collisionPadding?: number;
  readonly direction?: 'ltr' | 'rtl';
  readonly obstacles?: readonly Rect[];
}

export interface PlacedAnnotation {
  readonly id: string;
  readonly rect: Rect;
  readonly side: PlacementSide;
  readonly align: PlacementAlign;
}

export class AnnotationPlacementError extends Error {
  readonly annotationId: string;

  constructor(annotationId: string) {
    super(
      `No collision-free placement is available for annotation "${annotationId}".`,
    );
    this.name = 'AnnotationPlacementError';
    this.annotationId = annotationId;
  }
}

const DEFAULT_SAFE_AREA = 16;
const DEFAULT_OFFSET = 16;
const DEFAULT_COLLISION_PADDING = 8;

export function compareIds(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function rectsOverlap(left: Rect, right: Rect, padding = 0): boolean {
  return (
    left.x < right.x + right.width + padding &&
    left.x + left.width + padding > right.x &&
    left.y < right.y + right.height + padding &&
    left.y + left.height + padding > right.y
  );
}

export function isInsideBounds(rect: Rect, bounds: PlacementBounds): boolean {
  const safeArea = bounds.safeArea ?? DEFAULT_SAFE_AREA;
  return (
    rect.x >= safeArea &&
    rect.y >= safeArea &&
    rect.x + rect.width <= bounds.width - safeArea &&
    rect.y + rect.height <= bounds.height - safeArea
  );
}

export function placementCandidates(
  request: PlacementRequest,
  direction: 'ltr' | 'rtl' = 'ltr',
): readonly Omit<PlacedAnnotation, 'id'>[] {
  assertPlacementRequest(request);

  const sides: readonly PlacementSide[] =
    request.side && request.side !== 'auto'
      ? [request.side]
      : direction === 'rtl'
        ? ['left', 'right', 'bottom', 'top']
        : ['right', 'left', 'bottom', 'top'];
  const aligns: readonly PlacementAlign[] = request.align
    ? [request.align]
    : ['center', 'start', 'end'];

  const candidates: Omit<PlacedAnnotation, 'id'>[] = [];
  for (const side of sides) {
    for (const align of aligns) {
      candidates.push({
        rect: candidateRect(request, side, align, direction),
        side,
        align,
      });
    }
  }
  return candidates;
}

export function placeAnnotations(
  requests: readonly PlacementRequest[],
  bounds: PlacementBounds,
  options: PlacementOptions = {},
): readonly PlacedAnnotation[] {
  assertFinitePositive(bounds.width, 'bounds.width');
  assertFinitePositive(bounds.height, 'bounds.height');

  const collisionPadding =
    options.collisionPadding ?? DEFAULT_COLLISION_PADDING;
  const direction = options.direction ?? 'ltr';
  const obstacles = options.obstacles ?? [];
  const occupied: Rect[] = [];
  const result: PlacedAnnotation[] = [];
  const ids = new Set<string>();

  for (const request of [...requests].sort((a, b) => compareIds(a.id, b.id))) {
    if (ids.has(request.id)) {
      throw new TypeError(`Duplicate annotation id "${request.id}".`);
    }
    ids.add(request.id);

    const candidate = placementCandidates(request, direction).find(
      ({ rect }) =>
        isInsideBounds(rect, bounds) &&
        occupied.every(
          (other) => !rectsOverlap(rect, other, collisionPadding),
        ) &&
        obstacles.every(
          (obstacle) => !rectsOverlap(rect, obstacle, collisionPadding),
        ),
    );

    if (!candidate) {
      throw new AnnotationPlacementError(request.id);
    }

    const placed = { id: request.id, ...candidate };
    occupied.push(placed.rect);
    result.push(placed);
  }

  return result;
}

export function connectorPoints(
  placement: PlacedAnnotation,
  target: Rect,
): {
  readonly start: Point;
  readonly end: Point;
} {
  const centerX = target.x + target.width / 2;
  const centerY = target.y + target.height / 2;
  const box = placement.rect;

  switch (placement.side) {
    case 'top':
      return {
        start: {
          x: clamp(centerX, box.x, box.x + box.width),
          y: box.y + box.height,
        },
        end: { x: centerX, y: target.y },
      };
    case 'right':
      return {
        start: { x: box.x, y: clamp(centerY, box.y, box.y + box.height) },
        end: { x: target.x + target.width, y: centerY },
      };
    case 'bottom':
      return {
        start: { x: clamp(centerX, box.x, box.x + box.width), y: box.y },
        end: { x: centerX, y: target.y + target.height },
      };
    case 'left':
      return {
        start: {
          x: box.x + box.width,
          y: clamp(centerY, box.y, box.y + box.height),
        },
        end: { x: target.x, y: centerY },
      };
  }
}

export function standaloneArrowPoints(
  target: Rect,
  side: PlacementSide,
  offset = DEFAULT_OFFSET,
  length = 34,
  nudge: Point = { x: 0, y: 0 },
): { readonly start: Point; readonly end: Point } {
  const centerX = target.x + target.width / 2 + nudge.x;
  const centerY = target.y + target.height / 2 + nudge.y;

  switch (side) {
    case 'top':
      return {
        start: { x: centerX, y: target.y - offset - length + nudge.y },
        end: { x: centerX, y: target.y - offset + nudge.y },
      };
    case 'right':
      return {
        start: {
          x: target.x + target.width + offset + length + nudge.x,
          y: centerY,
        },
        end: { x: target.x + target.width + offset + nudge.x, y: centerY },
      };
    case 'bottom':
      return {
        start: {
          x: centerX,
          y: target.y + target.height + offset + length + nudge.y,
        },
        end: { x: centerX, y: target.y + target.height + offset + nudge.y },
      };
    case 'left':
      return {
        start: { x: target.x - offset - length + nudge.x, y: centerY },
        end: { x: target.x - offset + nudge.x, y: centerY },
      };
  }
}

function candidateRect(
  request: PlacementRequest,
  side: PlacementSide,
  align: PlacementAlign,
  direction: 'ltr' | 'rtl',
): Rect {
  const { target, size } = request;
  const offset = request.offset ?? DEFAULT_OFFSET;
  const nudge = request.nudge ?? { x: 0, y: 0 };
  let x: number;
  let y: number;

  if (side === 'top' || side === 'bottom') {
    x = alignedCoordinate(
      target.x,
      target.width,
      size.width,
      align,
      direction === 'rtl',
    );
    y =
      side === 'top'
        ? target.y - size.height - offset
        : target.y + target.height + offset;
  } else {
    x =
      side === 'left'
        ? target.x - size.width - offset
        : target.x + target.width + offset;
    y = alignedCoordinate(target.y, target.height, size.height, align, false);
  }

  return {
    x: normalizeNumber(x + nudge.x),
    y: normalizeNumber(y + nudge.y),
    width: normalizeNumber(size.width),
    height: normalizeNumber(size.height),
  };
}

function alignedCoordinate(
  targetStart: number,
  targetSize: number,
  boxSize: number,
  align: PlacementAlign,
  reverse: boolean,
): number {
  if (align === 'center') return targetStart + (targetSize - boxSize) / 2;
  if ((align === 'start') !== reverse) return targetStart;
  return targetStart + targetSize - boxSize;
}

function assertPlacementRequest(request: PlacementRequest): void {
  if (!request.id) throw new TypeError('Annotation id must not be empty.');
  assertRect(request.target, 'target');
  assertFinitePositive(request.size.width, 'size.width');
  assertFinitePositive(request.size.height, 'size.height');
  if (
    request.offset !== undefined &&
    (!Number.isFinite(request.offset) || request.offset < 0)
  ) {
    throw new RangeError('offset must be a non-negative finite number.');
  }
}

function assertRect(rect: Rect, label: string): void {
  assertFinite(rect.x, `${label}.x`);
  assertFinite(rect.y, `${label}.y`);
  assertFinitePositive(rect.width, `${label}.width`);
  assertFinitePositive(rect.height, `${label}.height`);
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite.`);
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
}

function normalizeNumber(value: number): number {
  const rounded = Math.round(value * 1_000) / 1_000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

import type { Frame, Rect } from '@guideshot/core';

export interface FrameInput {
  readonly frame?: Frame;
  readonly document: Rect;
  readonly viewport: Rect;
  readonly targets: Readonly<Record<string, Rect>>;
}

interface Insets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

type FrameWithArea = Exclude<Frame, { kind: 'viewport' } | { kind: 'page' }>;

export function resolveFrameRect(input: FrameInput): Rect {
  const frame = input.frame;
  if (frame === undefined || ('kind' in frame && frame.kind === 'viewport')) {
    return roundOut(clampRect(input.viewport, input.document), input.document);
  }
  if ('kind' in frame && frame.kind === 'page') {
    return roundOut(input.document, input.document);
  }

  const area = frame;
  const selected = sourceRect(area, input.targets);
  const padded = applyPadding(selected, normalizePadding(area.padding));
  const fitted = fitAspectRatio(
    padded,
    parseAspectRatio(area.aspectRatio),
    area.fit ?? 'expand',
  );
  return roundOut(clampRect(fitted, input.document), input.document);
}

export function unionRects(rectangles: readonly Rect[]): Rect {
  const first = rectangles[0];
  if (first === undefined) {
    throw new RangeError('At least one rectangle is required.');
  }

  let left = first.x;
  let top = first.y;
  let right = first.x + first.width;
  let bottom = first.y + first.height;
  for (const rectangle of rectangles.slice(1)) {
    assertRect(rectangle);
    left = Math.min(left, rectangle.x);
    top = Math.min(top, rectangle.y);
    right = Math.max(right, rectangle.x + rectangle.width);
    bottom = Math.max(bottom, rectangle.y + rectangle.height);
  }
  assertRect(first);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function applyPadding(rectangle: Rect, padding: Insets): Rect {
  assertRect(rectangle);
  return {
    x: rectangle.x - padding.left,
    y: rectangle.y - padding.top,
    width: rectangle.width + padding.left + padding.right,
    height: rectangle.height + padding.top + padding.bottom,
  };
}

export function fitAspectRatio(
  rectangle: Rect,
  aspectRatio: number | undefined,
  fit: 'expand' | 'contain' | 'cover' | 'crop' = 'expand',
): Rect {
  assertRect(rectangle);
  if (aspectRatio === undefined) return { ...rectangle };
  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    throw new RangeError('Aspect ratio must be a finite positive number.');
  }

  const current = rectangle.width / rectangle.height;
  if (Math.abs(current - aspectRatio) < Number.EPSILON) return { ...rectangle };

  const expands = fit === 'expand' || fit === 'contain';
  let width = rectangle.width;
  let height = rectangle.height;
  if (current < aspectRatio === expands) {
    width = height * aspectRatio;
  } else {
    height = width / aspectRatio;
  }

  return {
    x: rectangle.x - (width - rectangle.width) / 2,
    y: rectangle.y - (height - rectangle.height) / 2,
    width,
    height,
  };
}

export function relativeRect(rectangle: Rect, frame: Rect): Rect {
  return {
    x: rectangle.x - frame.x,
    y: rectangle.y - frame.y,
    width: rectangle.width,
    height: rectangle.height,
  };
}

function sourceRect(
  frame: FrameWithArea,
  targets: Readonly<Record<string, Rect>>,
): Rect {
  if ('target' in frame) return requiredTarget(targets, frame.target);
  if ('around' in frame) {
    return unionRects(
      frame.around.map((target) => requiredTarget(targets, target)),
    );
  }
  return frame.region;
}

function requiredTarget(
  targets: Readonly<Record<string, Rect>>,
  id: string,
): Rect {
  const rectangle = targets[id];
  if (rectangle === undefined) {
    throw new TypeError(`Frame target "${id}" has no measured rectangle.`);
  }
  return rectangle;
}

function normalizePadding(value: FrameWithArea['padding']): Insets {
  if (value === undefined) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof value === 'number') {
    return { top: value, right: value, bottom: value, left: value };
  }
  return value;
}

function parseAspectRatio(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const [width, height] = value.split(':').map(Number);
  if (
    width === undefined ||
    height === undefined ||
    width <= 0 ||
    height <= 0
  ) {
    throw new RangeError(`Invalid aspect ratio "${value}".`);
  }
  return width / height;
}

function clampRect(rectangle: Rect, bounds: Rect): Rect {
  assertRect(rectangle);
  assertRect(bounds);
  if (
    rectangle.x + rectangle.width <= bounds.x ||
    rectangle.y + rectangle.height <= bounds.y ||
    rectangle.x >= bounds.x + bounds.width ||
    rectangle.y >= bounds.y + bounds.height
  ) {
    throw new RangeError('Capture frame does not intersect the document.');
  }
  const width = Math.min(rectangle.width, bounds.width);
  const height = Math.min(rectangle.height, bounds.height);
  return {
    x: clamp(rectangle.x, bounds.x, bounds.x + bounds.width - width),
    y: clamp(rectangle.y, bounds.y, bounds.y + bounds.height - height),
    width,
    height,
  };
}

function roundOut(rectangle: Rect, bounds: Rect): Rect {
  const left = Math.max(bounds.x, Math.floor(rectangle.x));
  const top = Math.max(bounds.y, Math.floor(rectangle.y));
  const right = Math.min(
    bounds.x + bounds.width,
    Math.ceil(rectangle.x + rectangle.width),
  );
  const bottom = Math.min(
    bounds.y + bounds.height,
    Math.ceil(rectangle.y + rectangle.height),
  );
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function assertRect(rectangle: Rect): void {
  if (
    !Number.isFinite(rectangle.x) ||
    !Number.isFinite(rectangle.y) ||
    !Number.isFinite(rectangle.width) ||
    !Number.isFinite(rectangle.height) ||
    rectangle.width <= 0 ||
    rectangle.height <= 0
  ) {
    throw new RangeError(
      'Rectangle coordinates must be finite with positive dimensions.',
    );
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

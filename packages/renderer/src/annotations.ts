import type { ResolvedAnnotation } from './contracts.js';
import type { PlacementAlign, PlacementSide, Point } from './placement.js';
import { compareIds } from './placement.js';

export type SupportedAnnotationKind =
  | 'callout'
  | 'arrow'
  | 'spotlight'
  | 'outline'
  | 'marker'
  | 'label'
  | 'redaction';

export interface NormalizedPlacement {
  readonly side: PlacementSide | 'auto';
  readonly align?: PlacementAlign;
  readonly offset: number;
  readonly nudge: Point;
}

interface NormalizedBase {
  readonly id: string;
  readonly kind: SupportedAnnotationKind;
  readonly target: string;
  readonly padding: number;
}

export interface NormalizedCallout extends NormalizedBase {
  readonly kind: 'callout';
  readonly text: string;
  readonly placement: NormalizedPlacement;
  readonly connector: boolean;
  readonly connectorAnchor: 'center' | 'edge';
  readonly emphasis?: 'spotlight' | 'outline';
}

export interface NormalizedArrow extends NormalizedBase {
  readonly kind: 'arrow';
  readonly placement: NormalizedPlacement;
}

export interface NormalizedSpotlight extends NormalizedBase {
  readonly kind: 'spotlight';
}

export interface NormalizedOutline extends NormalizedBase {
  readonly kind: 'outline';
}

export interface NormalizedMarker extends NormalizedBase {
  readonly kind: 'marker';
  readonly text: string;
  readonly placement: NormalizedPlacement;
}

export interface NormalizedLabel extends NormalizedBase {
  readonly kind: 'label';
  readonly text: string;
  readonly placement: NormalizedPlacement;
}

export interface NormalizedRedaction extends NormalizedBase {
  readonly kind: 'redaction';
}

export type NormalizedAnnotation =
  | NormalizedCallout
  | NormalizedArrow
  | NormalizedSpotlight
  | NormalizedOutline
  | NormalizedMarker
  | NormalizedLabel
  | NormalizedRedaction;

type UnknownRecord = Record<string, unknown>;

export function normalizeAnnotations(
  annotations: readonly ResolvedAnnotation[],
): readonly NormalizedAnnotation[] {
  const normalized = annotations
    .map(normalizeAnnotation)
    .sort((left, right) => compareIds(left.id, right.id));
  const ids = new Set<string>();
  for (const annotation of normalized) {
    if (ids.has(annotation.id)) {
      throw new TypeError(`Duplicate annotation id "${annotation.id}".`);
    }
    ids.add(annotation.id);
  }
  return normalized;
}

export function normalizeAnnotation(
  annotation: ResolvedAnnotation,
): NormalizedAnnotation {
  const definition = asRecord(annotation.definition, 'annotation.definition');
  const id = requiredString(definition.id, 'annotation.id');
  const kind = annotationKind(definition.kind);
  const target = requiredString(definition.target, `annotation "${id}" target`);
  const padding = nonNegativeNumber(
    definition.padding,
    6,
    `annotation "${id}" padding`,
  );

  switch (kind) {
    case 'callout': {
      const connector = optionalRecord(definition.connector);
      const emphasis = optionalRecord(definition.emphasis);
      const emphasisKind = optionalEnum(emphasis?.kind, [
        'spotlight',
        'outline',
      ] as const);
      const result: NormalizedCallout = {
        id,
        kind,
        target,
        padding: nonNegativeNumber(
          emphasis?.padding,
          padding,
          `annotation "${id}" padding`,
        ),
        text: resolvedText(annotation, definition),
        placement: normalizePlacement(definition.placement, id),
        connector: connector?.kind === 'arrow',
        connectorAnchor: connector?.anchor === 'center' ? 'center' : 'edge',
      };
      return emphasisKind ? { ...result, emphasis: emphasisKind } : result;
    }
    case 'arrow':
      return {
        id,
        kind,
        target,
        padding,
        placement: normalizePlacement(definition.placement, id),
      };
    case 'spotlight':
      return { id, kind, target, padding };
    case 'outline':
      return { id, kind, target, padding };
    case 'marker':
      return {
        id,
        kind,
        target,
        padding,
        text: resolvedText(annotation, definition, '•'),
        placement: normalizePlacement(definition.placement, id, 8),
      };
    case 'label':
      return {
        id,
        kind,
        target,
        padding,
        text: resolvedText(annotation, definition),
        placement: normalizePlacement(definition.placement, id, 10),
      };
    case 'redaction':
      return { id, kind, target, padding };
  }
}

function resolvedText(
  annotation: ResolvedAnnotation,
  definition: UnknownRecord,
  fallback = '',
): string {
  if (typeof annotation.text === 'string') return annotation.text;
  if (typeof definition.content === 'string') return definition.content;
  const content = optionalRecord(definition.content);
  if (content) {
    if (typeof content.text === 'string') return content.text;
    if (typeof content.literal === 'string') return content.literal;
  }
  if (fallback) return fallback;
  throw new TypeError(
    `Annotation "${String(definition.id)}" requires resolved plain text.`,
  );
}

function normalizePlacement(
  value: unknown,
  id: string,
  defaultOffset = 16,
): NormalizedPlacement {
  const placement = optionalRecord(value);
  const side = optionalEnum(placement?.side, [
    'auto',
    'top',
    'right',
    'bottom',
    'left',
  ] as const);
  const align = optionalEnum(placement?.align, [
    'start',
    'center',
    'end',
  ] as const);
  const nudge = optionalRecord(placement?.nudge);
  const result: NormalizedPlacement = {
    side: side ?? 'auto',
    offset: nonNegativeNumber(
      placement?.offset,
      defaultOffset,
      `annotation "${id}" placement.offset`,
    ),
    nudge: {
      x: finiteNumber(nudge?.x, 0, `annotation "${id}" placement.nudge.x`),
      y: finiteNumber(nudge?.y, 0, `annotation "${id}" placement.nudge.y`),
    },
  };
  return align ? { ...result, align } : result;
}

function annotationKind(value: unknown): SupportedAnnotationKind {
  const kind = optionalEnum(value, [
    'callout',
    'arrow',
    'spotlight',
    'outline',
    'marker',
    'label',
    'redaction',
  ] as const);
  if (!kind)
    throw new TypeError(`Unsupported annotation kind "${String(value)}".`);
  return kind;
}

function optionalEnum<const T extends readonly string[]>(
  value: unknown,
  values: T,
): T[number] | undefined {
  return typeof value === 'string' && values.includes(value)
    ? value
    : undefined;
}

function asRecord(value: unknown, label: string): UnknownRecord {
  const record = optionalRecord(value);
  if (!record) throw new TypeError(`${label} must be an object.`);
  return record;
}

function optionalRecord(value: unknown): UnknownRecord | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return undefined;
  return value as UnknownRecord;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function nonNegativeNumber(
  value: unknown,
  fallback: number,
  label: string,
): number {
  const number = finiteNumber(value, fallback, label);
  if (number < 0) throw new RangeError(`${label} must not be negative.`);
  return number;
}

function finiteNumber(value: unknown, fallback: number, label: string): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }
  return value;
}

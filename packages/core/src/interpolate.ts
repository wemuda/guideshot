import type { JsonObject, JsonValue, VariantValue } from '@guideshot/schema';

import { GuideShotError } from './diagnostics.js';

const REFERENCE = /\$\{([^}]+)\}/g;
const FULL_REFERENCE = /^\$\{([^}]+)\}$/;
const SAFE_SEGMENT = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

export interface InterpolationContext {
  scenario?: Readonly<JsonObject>;
  variant: Readonly<Record<string, VariantValue>>;
}

export function interpolate<T>(value: T, context: InterpolationContext): T {
  return interpolateValue(value, context) as T;
}

export function interpolateString(
  value: string,
  context: InterpolationContext,
): JsonValue {
  const full = FULL_REFERENCE.exec(value);
  if (full !== null) {
    return resolveReference(requiredGroup(full, 1), context);
  }

  REFERENCE.lastIndex = 0;
  const interpolated = value.replace(
    REFERENCE,
    (_match, rawReference: string) => {
      const resolved = resolveReference(rawReference, context);
      if (
        typeof resolved === 'object' ||
        resolved === null ||
        Array.isArray(resolved)
      ) {
        throw unresolved(
          rawReference,
          'Embedded references must resolve to a string, number, or boolean.',
        );
      }
      return String(resolved);
    },
  );
  if (interpolated.includes('${')) {
    throw unresolved(value, 'Reference syntax is incomplete.');
  }
  return interpolated;
}

function interpolateValue(
  value: unknown,
  context: InterpolationContext,
): unknown {
  if (typeof value === 'string') {
    return interpolateString(value, context);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => interpolateValue(entry, context));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        interpolateValue(entry, context),
      ]),
    );
  }

  return value;
}

function resolveReference(
  reference: string,
  context: InterpolationContext,
): JsonValue {
  const segments = reference.split('.');
  const root = segments.shift();
  if (
    (root !== 'scenario' && root !== 'variant') ||
    segments.length === 0 ||
    segments.some(
      (segment) =>
        !SAFE_SEGMENT.test(segment) || FORBIDDEN_SEGMENTS.has(segment),
    )
  ) {
    throw unresolved(
      reference,
      'References must use ${scenario.name} or ${variant.name} lookups.',
    );
  }

  let current: unknown =
    root === 'scenario' ? context.scenario : context.variant;
  for (const segment of segments) {
    if (!isPlainObject(current) || !Object.hasOwn(current, segment)) {
      throw unresolved(reference, `No value exists for "${reference}".`);
    }
    current = current[segment];
  }

  if (!isJsonValue(current)) {
    throw unresolved(
      reference,
      `The value for "${reference}" is not JSON data.`,
    );
  }

  return current;
}

function unresolved(reference: string, message: string): GuideShotError {
  return new GuideShotError('VARIABLE_UNRESOLVED', message, {
    details: { reference },
  });
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  return isPlainObject(value) && Object.values(value).every(isJsonValue);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function requiredGroup(match: RegExpExecArray, index: number): string {
  const value = match[index];
  if (value === undefined) {
    throw new GuideShotError(
      'VARIABLE_UNRESOLVED',
      'Reference syntax is incomplete.',
    );
  }
  return value;
}

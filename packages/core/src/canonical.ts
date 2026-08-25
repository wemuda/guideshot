import { createHash } from 'node:crypto';

import { GuideShotError } from './diagnostics.js';

export function canonicalSerialize(value: unknown): string {
  return serialize(value, new Set<object>());
}

export function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashCanonical(value: unknown): string {
  return sha256(canonicalSerialize(value));
}

export function createCaptureHash(intent: unknown): string {
  return hashCanonical({ kind: 'capture', version: 1, intent });
}

export function createCompositionHash(intent: unknown): string {
  return hashCanonical({ kind: 'composition', version: 1, intent });
}

function serialize(value: unknown, ancestors: Set<object>): string {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw invalidCanonicalValue('non-finite number');
    }

    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }

  if (Array.isArray(value)) {
    guardCycle(value, ancestors);
    const result = `[${value.map((entry) => serialize(entry, ancestors)).join(',')}]`;
    ancestors.delete(value);
    return result;
  }

  if (isPlainObject(value)) {
    guardCycle(value, ancestors);
    const entries = Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => compareStrings(left, right))
      .map(
        ([key, entry]) =>
          `${JSON.stringify(key)}:${serialize(entry, ancestors)}`,
      );
    ancestors.delete(value);
    return `{${entries.join(',')}}`;
  }

  throw invalidCanonicalValue(
    value === undefined ? 'undefined array/root value' : typeof value,
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function guardCycle(value: object, ancestors: Set<object>): void {
  if (ancestors.has(value)) {
    throw invalidCanonicalValue('cyclic object');
  }

  ancestors.add(value);
}

function invalidCanonicalValue(kind: string): GuideShotError {
  return new GuideShotError(
    'RECIPE_SCHEMA_INVALID',
    `Cannot canonically serialize ${kind}.`,
  );
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

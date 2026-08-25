import type { VariantValue } from '@guideshot/schema';

import type { MatrixDefinition, VariantRow } from './contracts.js';
import { GuideShotError } from './diagnostics.js';

export function expandMatrix(matrix?: MatrixDefinition): VariantRow[] {
  if (matrix === undefined) {
    return [{ key: 'default', values: {} }];
  }

  const dimensions = Object.keys(matrix.dimensions).sort(compareStrings);
  validateDimensions(dimensions, matrix);

  let rows: Record<string, VariantValue>[] = [{}];
  for (const dimension of dimensions) {
    const values = matrix.dimensions[dimension] ?? [];
    rows = rows.flatMap((row) =>
      values.map((value) => ({ ...row, [dimension]: value })),
    );
  }

  rows = rows.filter(
    (row) => !(matrix.exclude ?? []).some((rule) => matchesRule(row, rule)),
  );

  for (const included of matrix.include ?? []) {
    validateIncludedRow(included, dimensions, matrix);
    if (!rows.some((row) => rowsEqual(row, included))) {
      rows.push(copySorted(included));
    }
  }

  if (dimensions.length === 0 && rows.length === 0) {
    rows.push({});
  }

  const keys = new Map<string, Record<string, VariantValue>>();
  const expanded = rows.map((values) => {
    const sorted = copySorted(values);
    const key = createVariantKey(sorted);
    const previous = keys.get(key);
    if (previous !== undefined && !rowsEqual(previous, sorted)) {
      throw new GuideShotError(
        'OUTPUT_COLLISION',
        `Variant values produce the same key "${key}".`,
        { details: { key } },
      );
    }
    keys.set(key, sorted);
    return { key, values: sorted };
  });

  return expanded;
}

export function createVariantKey(
  variants: Readonly<Record<string, VariantValue>>,
): string {
  const entries = Object.entries(variants).sort(([left], [right]) =>
    compareStrings(left, right),
  );
  if (entries.length === 0) {
    return 'default';
  }

  return entries
    .map(
      ([dimension, value]) =>
        `${encodeURIComponent(dimension)}=${encodeURIComponent(String(value))}`,
    )
    .join(';');
}

export function matchesVariantFilter(
  variants: Readonly<Record<string, VariantValue>>,
  filter: Readonly<Record<string, VariantValue>>,
): boolean {
  return matchesRule(variants, filter);
}

function validateDimensions(
  dimensions: readonly string[],
  matrix: MatrixDefinition,
): void {
  for (const dimension of dimensions) {
    if (!isDimensionName(dimension)) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Invalid matrix dimension name "${dimension}".`,
      );
    }

    const values = matrix.dimensions[dimension] ?? [];
    if (values.length === 0) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Matrix dimension "${dimension}" must contain at least one value.`,
      );
    }

    const encoded = new Set<string>();
    for (const value of values) {
      const key = String(value);
      if (encoded.has(key)) {
        throw new GuideShotError(
          'OUTPUT_COLLISION',
          `Matrix dimension "${dimension}" contains colliding value "${key}".`,
        );
      }
      encoded.add(key);
    }
  }

  for (const rule of matrix.exclude ?? []) {
    for (const dimension of Object.keys(rule)) {
      if (!dimensions.includes(dimension)) {
        throw new GuideShotError(
          'RECIPE_SCHEMA_INVALID',
          `Matrix exclusion references unknown dimension "${dimension}".`,
        );
      }
    }
  }
}

function validateIncludedRow(
  row: Readonly<Record<string, VariantValue>>,
  dimensions: readonly string[],
  matrix: MatrixDefinition,
): void {
  const includedDimensions = Object.keys(row).sort(compareStrings);
  if (
    includedDimensions.length !== dimensions.length ||
    includedDimensions.some(
      (dimension, index) => dimension !== dimensions[index],
    )
  ) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      'Every matrix inclusion must specify exactly every declared dimension.',
    );
  }

  for (const dimension of dimensions) {
    const value = row[dimension];
    const allowed = matrix.dimensions[dimension] ?? [];
    if (!allowed.some((candidate) => Object.is(candidate, value))) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Matrix inclusion uses an unsupported value for "${dimension}".`,
      );
    }
  }
}

function matchesRule(
  row: Readonly<Record<string, VariantValue>>,
  rule: Readonly<Record<string, VariantValue>>,
): boolean {
  return Object.entries(rule).every(([dimension, value]) =>
    Object.is(row[dimension], value),
  );
}

function rowsEqual(
  left: Readonly<Record<string, VariantValue>>,
  right: Readonly<Record<string, VariantValue>>,
): boolean {
  const dimensions = Object.keys(left);
  return (
    dimensions.length === Object.keys(right).length &&
    dimensions.every((dimension) =>
      Object.is(left[dimension], right[dimension]),
    )
  );
}

function copySorted(
  values: Readonly<Record<string, VariantValue>>,
): Record<string, VariantValue> {
  return Object.fromEntries(
    Object.entries(values).sort(([left], [right]) =>
      compareStrings(left, right),
    ),
  );
}

function isDimensionName(value: string): boolean {
  return /^[a-z][a-zA-Z0-9_-]*$/.test(value);
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

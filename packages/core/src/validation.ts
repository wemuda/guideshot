import type { ErrorObject, ValidateFunction } from 'ajv';
import Ajv2020Import from 'ajv/dist/2020.js';
import addFormatsImport from 'ajv-formats';
import {
  PublicManifestSchema,
  RecipeSchema,
  type JsonObject,
  type PublicManifest,
  type Recipe,
} from '@guideshot/schema';
import {
  parse as parseJsonc,
  printParseErrorCode,
  type ParseError,
} from 'jsonc-parser';

import type { GuideShotConfig, RecipeSource } from './contracts.js';
import { GuideShotError } from './diagnostics.js';

const Ajv2020 = Ajv2020Import.default;
const addFormats = addFormatsImport.default;

const ajv = addFormats(
  new Ajv2020({
    allErrors: true,
    allowUnionTypes: true,
    strict: true,
  }),
);

const recipeValidator = ajv.compile<Recipe>(RecipeSchema);
const manifestValidator = ajv.compile<PublicManifest>(PublicManifestSchema);
const extensionValidators = new WeakMap<object, ValidateFunction>();

export interface ParseRecipeOptions {
  file?: string;
  format?: 'json' | 'jsonc';
}

export function parseRecipe(
  source: string,
  options: ParseRecipeOptions = {},
): Recipe {
  const errors: ParseError[] = [];
  const format = options.format ?? inferFormat(options.file);
  const value = parseJsonc(source, errors, {
    allowEmptyContent: false,
    allowTrailingComma: format === 'jsonc',
    disallowComments: format === 'json',
  }) as unknown;

  if (errors.length > 0) {
    const first = errors[0];
    if (first === undefined) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        'Recipe is not valid JSON.',
      );
    }
    const position = positionAt(source, first.offset);
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      `Recipe contains invalid ${format.toUpperCase()}: ${printParseErrorCode(first.error)}.`,
      {
        location: compactLocation({
          ...(options.file === undefined ? {} : { file: options.file }),
          line: position.line,
          column: position.column,
        }),
      },
    );
  }

  return validateRecipe(value, options.file);
}

export function validateRecipe(value: unknown, file?: string): Recipe {
  if (!recipeValidator(value)) {
    throw schemaError('Recipe', recipeValidator.errors, file);
  }
  return value;
}

export function validateManifest(
  value: unknown,
  file?: string,
): PublicManifest {
  if (!manifestValidator(value)) {
    throw new GuideShotError(
      'MANIFEST_INVALID',
      formatValidationMessage('Manifest', manifestValidator.errors),
      {
        ...(file === undefined ? {} : { location: { file } }),
        details: validationDetails(manifestValidator.errors),
      },
    );
  }
  return value;
}

export function validateConfig(config: GuideShotConfig): void {
  if (config.recipes.length === 0) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      'Configuration must include at least one recipe pattern.',
    );
  }
  if (Object.keys(config.profiles).length === 0) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      'Configuration must register at least one capture profile.',
    );
  }
  if (
    config.capture?.concurrency !== undefined &&
    (!Number.isInteger(config.capture.concurrency) ||
      config.capture.concurrency < 1)
  ) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      'Capture concurrency must be a positive integer.',
    );
  }
  for (const scenario of Object.values(config.scenarios ?? {})) {
    if (
      scenario.concurrencyKey !== undefined &&
      scenario.concurrencyKey.trim() === ''
    ) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        'Scenario concurrency keys cannot be empty.',
      );
    }
  }
  for (const [name, profile] of Object.entries(config.profiles)) {
    if (
      !Number.isInteger(profile.viewport.width) ||
      profile.viewport.width <= 0 ||
      !Number.isInteger(profile.viewport.height) ||
      profile.viewport.height <= 0
    ) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Profile "${name}" has an invalid viewport.`,
      );
    }
    if (
      profile.pixelRatio !== undefined &&
      (!Number.isFinite(profile.pixelRatio) || profile.pixelRatio <= 0)
    ) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Profile "${name}" has an invalid pixel ratio.`,
      );
    }
  }
}

export function validateRecipeSemantics(
  source: RecipeSource,
  config: GuideShotConfig,
): void {
  const { recipe } = source;
  const profile = recipe.profile ?? defaultProfileName(config);
  if (config.profiles[profile] === undefined) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      `Recipe "${recipe.id}" references unknown profile "${profile}".`,
      recipeOptions(source, { profile }),
    );
  }

  validateScenario(recipe, source, config);
  validateMatrix(recipe, source, config);
  validateAnnotationIds(recipe, source);
}

export function defaultProfileName(config: GuideShotConfig): string {
  const names = Object.keys(config.profiles).sort(compareStrings);
  const name = names[0];
  if (name === undefined) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      'No capture profile is registered.',
    );
  }
  return name;
}

function validateScenario(
  recipe: Recipe,
  source: RecipeSource,
  config: GuideShotConfig,
): void {
  if (recipe.scenario === undefined) {
    return;
  }
  const scenario = config.scenarios?.[recipe.scenario.use];
  if (scenario === undefined) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      `Recipe "${recipe.id}" references unknown scenario "${recipe.scenario.use}".`,
      recipeOptions(source, { scenario: recipe.scenario.use }),
    );
  }

  const validator = extensionValidator(scenario.schema);
  const input = recipe.scenario.with ?? {};
  if (!validator(input)) {
    throw new GuideShotError(
      'RECIPE_SCHEMA_INVALID',
      formatValidationMessage(
        `Scenario "${recipe.scenario.use}" parameters`,
        validator.errors,
      ),
      {
        ...recipeOptions(source),
        details: validationDetails(validator.errors),
      },
    );
  }
}

function extensionValidator(schema: object): ValidateFunction {
  const existing = extensionValidators.get(schema);
  if (existing !== undefined) {
    return existing;
  }
  const validator = ajv.compile(schema);
  extensionValidators.set(schema, validator);
  return validator;
}

function validateMatrix(
  recipe: Recipe,
  source: RecipeSource,
  config: GuideShotConfig,
): void {
  for (const [name, values] of Object.entries(
    recipe.matrix?.dimensions ?? {},
  )) {
    const definition = config.dimensions?.[name];
    if (definition === undefined) {
      throw new GuideShotError(
        'EXTENSION_NOT_REGISTERED',
        `Recipe "${recipe.id}" references unknown dimension "${name}".`,
        recipeOptions(source, { dimension: name }),
      );
    }
    for (const value of values) {
      if (!definition.values.some((candidate) => Object.is(candidate, value))) {
        throw new GuideShotError(
          'RECIPE_SCHEMA_INVALID',
          `Dimension "${name}" does not allow value "${String(value)}".`,
          recipeOptions(source, { dimension: name }),
        );
      }
    }
  }
}

function validateAnnotationIds(recipe: Recipe, source: RecipeSource): void {
  const ids = new Set<string>();
  for (const annotation of recipe.annotations ?? []) {
    if (ids.has(annotation.id)) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Recipe "${recipe.id}" contains duplicate annotation id "${annotation.id}".`,
        recipeOptions(source, { annotationId: annotation.id }),
      );
    }
    ids.add(annotation.id);
  }
}

function schemaError(
  subject: string,
  errors: readonly ErrorObject[] | null | undefined,
  file?: string,
): GuideShotError {
  return new GuideShotError(
    'RECIPE_SCHEMA_INVALID',
    formatValidationMessage(subject, errors),
    {
      ...(file === undefined ? {} : { location: { file } }),
      details: validationDetails(errors),
    },
  );
}

function formatValidationMessage(
  subject: string,
  errors: readonly ErrorObject[] | null | undefined,
): string {
  const first = errors?.[0];
  if (first === undefined) {
    return `${subject} does not match its schema.`;
  }
  const path = first.instancePath === '' ? '/' : first.instancePath;
  return `${subject} is invalid at ${path}: ${first.message ?? first.keyword}.`;
}

function validationDetails(
  errors: readonly ErrorObject[] | null | undefined,
): JsonObject {
  return {
    errors: (errors ?? []).map((error) => ({
      path: error.instancePath,
      keyword: error.keyword,
      message: error.message ?? '',
    })),
  };
}

function recipeOptions(
  source: RecipeSource,
  details?: JsonObject,
): { recipeId: string; location: { file: string }; details?: JsonObject } {
  return {
    recipeId: source.recipe.id,
    location: { file: source.file },
    ...(details === undefined ? {} : { details }),
  };
}

function inferFormat(file?: string): 'json' | 'jsonc' {
  return file?.toLowerCase().endsWith('.jsonc') === true ? 'jsonc' : 'json';
}

function positionAt(
  source: string,
  offset: number,
): {
  line: number;
  column: number;
} {
  const prefix = source.slice(0, offset);
  const lines = prefix.split(/\r?\n/);
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

function compactLocation(location: {
  file?: string;
  line: number;
  column: number;
}): { file?: string; line: number; column: number } {
  return location.file === undefined
    ? { line: location.line, column: location.column }
    : { file: location.file, line: location.line, column: location.column };
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

import type {
  Action,
  Annotation,
  Expectation,
  JsonObject,
  JsonValue,
  LocalizedText,
  Recipe,
  VariantValue,
} from '@guideshot/schema';

import type { ResolvedAnnotation, TranslationProvider } from './contracts.js';
import { GuideShotError } from './diagnostics.js';

export interface ResolveTextContext {
  locale: string;
  variables: Readonly<JsonObject>;
  variants: Readonly<Record<string, VariantValue>>;
}

export async function resolveLocalizedText(
  value: LocalizedText,
  provider: TranslationProvider | undefined,
  context: ResolveTextContext,
): Promise<string> {
  if (typeof value === 'string') {
    return value;
  }
  const candidate = value as Readonly<Record<string, unknown>>;
  if (
    typeof candidate.message === 'string' &&
    (candidate.args === undefined || isJsonObject(candidate.args))
  ) {
    if (provider === undefined) {
      throw new GuideShotError(
        'EXTENSION_NOT_REGISTERED',
        `Translation message "${candidate.message}" requires a translation provider.`,
      );
    }
    return provider.resolve(candidate.message, {
      locale: context.locale,
      args: candidate.args ?? {},
      variables: context.variables,
    });
  }

  const localeMap = value as Readonly<Record<string, string>>;
  const exact = localeMap[context.locale];
  if (exact !== undefined) {
    return exact;
  }
  const baseLocale = context.locale.split('-')[0];
  const base = baseLocale === undefined ? undefined : localeMap[baseLocale];
  if (base !== undefined) {
    return base;
  }
  throw new GuideShotError(
    'VARIABLE_UNRESOLVED',
    `Localized text has no value for locale "${context.locale}".`,
    { details: { locale: context.locale } },
  );
}

export async function resolveRecipeText(
  recipe: Recipe,
  provider: TranslationProvider | undefined,
  context: ResolveTextContext,
): Promise<Recipe> {
  const prepare = await Promise.all(
    (recipe.prepare ?? []).map((action) =>
      resolveActionText(action, provider, context),
    ),
  );
  const ready = await Promise.all(
    (recipe.ready ?? []).map((expectation) =>
      resolveExpectationText(expectation, provider, context),
    ),
  );
  const annotations = await Promise.all(
    (recipe.annotations ?? []).map((annotation) =>
      resolveAnnotationText(annotation, provider, context),
    ),
  );
  const accessibility =
    'alt' in recipe.accessibility
      ? {
          alt: await resolveLocalizedText(
            recipe.accessibility.alt,
            provider,
            context,
          ),
        }
      : recipe.accessibility;

  return {
    ...recipe,
    ...(recipe.prepare === undefined ? {} : { prepare }),
    ...(recipe.ready === undefined ? {} : { ready }),
    ...(recipe.annotations === undefined ? {} : { annotations }),
    accessibility,
  };
}

export function resolvedAnnotations(recipe: Recipe): ResolvedAnnotation[] {
  return (recipe.annotations ?? []).map((definition) => ({
    definition,
    ...(definition.kind === 'callout' && typeof definition.content === 'string'
      ? { text: definition.content }
      : {}),
  }));
}

export function resolvedAlt(recipe: Recipe): string {
  const accessibility = recipe.accessibility;
  if ('decorative' in accessibility) {
    return '';
  }
  if (typeof accessibility.alt !== 'string') {
    throw new GuideShotError(
      'VARIABLE_UNRESOLVED',
      `Alt text for recipe "${recipe.id}" has not been resolved.`,
      { recipeId: recipe.id },
    );
  }
  return accessibility.alt;
}

async function resolveActionText(
  action: Action,
  provider: TranslationProvider | undefined,
  context: ResolveTextContext,
): Promise<Action> {
  if (action.do !== 'fill') {
    return action;
  }
  return {
    ...action,
    value: await resolveLocalizedText(action.value, provider, context),
  };
}

async function resolveExpectationText(
  expectation: Expectation,
  provider: TranslationProvider | undefined,
  context: ResolveTextContext,
): Promise<Expectation> {
  if (expectation.expect !== 'text' && expectation.expect !== 'value') {
    return expectation;
  }
  return {
    ...expectation,
    value: await resolveLocalizedText(expectation.value, provider, context),
  };
}

async function resolveAnnotationText(
  annotation: Annotation,
  provider: TranslationProvider | undefined,
  context: ResolveTextContext,
): Promise<Annotation> {
  if (annotation.kind !== 'callout') {
    return annotation;
  }
  return {
    ...annotation,
    content: await resolveLocalizedText(annotation.content, provider, context),
  };
}

export function assertJsonPrimitive(
  value: JsonValue,
  description: string,
): string | number | boolean {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  throw new GuideShotError(
    'VARIABLE_UNRESOLVED',
    `${description} must resolve to a string, number, or boolean.`,
  );
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

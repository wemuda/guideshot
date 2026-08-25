import type { Recipe } from '@guideshot/schema';

import type {
  BrowserCookie,
  BrowserStatePatch,
  GuideShotConfig,
  LocalStorageState,
  PlannedJob,
  ResolvedCaptureJob,
  ScenarioResult,
} from './contracts.js';
import { GuideShotError } from './diagnostics.js';
import { interpolate } from './interpolate.js';
import { resolvePageUrl } from './safety.js';
import { resolveRecipeText } from './text.js';
import { validateRecipe } from './validation.js';

export interface ResolveJobOptions {
  baseUrl: URL;
  signal?: AbortSignal;
  fetch?: typeof globalThis.fetch;
}

export interface ResolvedJob {
  capture: ResolvedCaptureJob;
  recipe: Recipe;
  cleanup?: () => void | Promise<void>;
}

export async function resolveJob(
  planned: PlannedJob,
  config: GuideShotConfig,
  options: ResolveJobOptions,
): Promise<ResolvedJob> {
  const dimensionState = await resolveDimensions(
    planned,
    config,
    options.signal,
  );
  const scenario = await prepareScenario(planned, config, options);
  const safeVariables = scenario?.variables ?? {};
  const browser = mergeBrowserState(
    profileBrowserState(planned),
    dimensionState,
    scenario?.browser ?? {},
  );
  const interpolatedRecipe = validateRecipe(
    interpolate(planned.recipe, {
      scenario: safeVariables,
      variant: planned.variants,
    }),
    planned.recipeFile,
  );
  const recipe = validateRecipe(
    await resolveRecipeText(interpolatedRecipe, config.translations, {
      locale: browser.locale ?? 'en',
      variables: safeVariables,
      variants: planned.variants,
    }),
    planned.recipeFile,
  );
  resolvePageUrl(options.baseUrl, recipe.page.path);
  const result: ResolvedJob = {
    recipe,
    capture: {
      key: planned.key,
      recipeId: planned.recipeId,
      variantKey: planned.variantKey,
      variants: planned.variants,
      profile: planned.captureIntent.profileConfig,
      page: recipe.page,
      prepare: recipe.prepare ?? [],
      ready: recipe.ready ?? [],
      capture: recipe.capture ?? {},
      browser,
      safeVariables,
    },
    ...(scenario?.cleanup === undefined ? {} : { cleanup: scenario.cleanup }),
  };
  return result;
}

export function mergeBrowserState(
  ...patches: readonly BrowserStatePatch[]
): BrowserStatePatch {
  const scalar: BrowserStatePatch = {};
  const cookies = new Map<string, BrowserCookie>();
  const storage = new Map<string, Map<string, string>>();
  const headers: Record<string, string> = {};

  for (const patch of patches) {
    assignDefinedScalar(scalar, patch, 'locale');
    assignDefinedScalar(scalar, patch, 'timezoneId');
    assignDefinedScalar(scalar, patch, 'colorScheme');
    assignDefinedScalar(scalar, patch, 'reducedMotion');
    for (const cookie of patch.cookies ?? []) {
      cookies.set(cookieKey(cookie), cookie);
    }
    for (const origin of patch.localStorage ?? []) {
      const values = storage.get(origin.origin) ?? new Map<string, string>();
      for (const [key, value] of Object.entries(origin.values)) {
        values.set(key, value);
      }
      storage.set(origin.origin, values);
    }
    Object.assign(headers, patch.extraHTTPHeaders);
  }

  return {
    ...scalar,
    ...(cookies.size === 0 ? {} : { cookies: [...cookies.values()] }),
    ...(storage.size === 0
      ? {}
      : {
          localStorage: [...storage.entries()].map(
            ([origin, values]): LocalStorageState => ({
              origin,
              values: Object.fromEntries(values),
            }),
          ),
        }),
    ...(Object.keys(headers).length === 0 ? {} : { extraHTTPHeaders: headers }),
  };
}

async function resolveDimensions(
  planned: PlannedJob,
  config: GuideShotConfig,
  signal?: AbortSignal,
): Promise<BrowserStatePatch> {
  const patches: BrowserStatePatch[] = [];
  for (const dimension of Object.keys(planned.variants).sort(compareStrings)) {
    const definition = config.dimensions?.[dimension];
    if (definition === undefined) {
      throw new GuideShotError(
        'EXTENSION_NOT_REGISTERED',
        `Dimension "${dimension}" is not registered.`,
        { recipeId: planned.recipeId, jobKey: planned.key },
      );
    }
    const value = planned.variants[dimension];
    if (value === undefined) {
      throw new GuideShotError(
        'RECIPE_SCHEMA_INVALID',
        `Dimension "${dimension}" has no resolved value.`,
        { recipeId: planned.recipeId, jobKey: planned.key },
      );
    }
    patches.push(
      await definition.resolve(value, {
        dimension,
        variants: planned.variants,
        ...(signal === undefined ? {} : { signal }),
      }),
    );
  }
  return mergeBrowserState(...patches);
}

async function prepareScenario(
  planned: PlannedJob,
  config: GuideShotConfig,
  options: ResolveJobOptions,
): Promise<ScenarioResult | undefined> {
  const reference = planned.recipe.scenario;
  if (reference === undefined) {
    return undefined;
  }
  const definition = config.scenarios?.[reference.use];
  if (definition === undefined) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      `Scenario "${reference.use}" is not registered.`,
      { recipeId: planned.recipeId, jobKey: planned.key },
    );
  }

  const input = interpolate(reference.with ?? {}, {
    variant: planned.variants,
  });
  try {
    return await definition.prepare(
      {
        baseUrl: options.baseUrl,
        recipeId: planned.recipeId,
        variantKey: planned.variantKey,
        variants: planned.variants,
        fetch: options.fetch ?? globalThis.fetch,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      },
      input,
    );
  } catch (cause) {
    throw new GuideShotError(
      'SCENARIO_FAILED',
      `Scenario "${reference.use}" failed for ${planned.key}.`,
      {
        recipeId: planned.recipeId,
        jobKey: planned.key,
        cause,
      },
    );
  }
}

function profileBrowserState(planned: PlannedJob): BrowserStatePatch {
  const profile = planned.captureIntent.profileConfig;
  return {
    ...(profile.locale === undefined ? {} : { locale: profile.locale }),
    ...(profile.timezoneId === undefined
      ? {}
      : { timezoneId: profile.timezoneId }),
    ...(profile.colorScheme === undefined
      ? {}
      : { colorScheme: profile.colorScheme }),
    ...(profile.reducedMotion === undefined
      ? {}
      : { reducedMotion: profile.reducedMotion }),
  };
}

function assignDefinedScalar<
  TKey extends 'locale' | 'timezoneId' | 'colorScheme' | 'reducedMotion',
>(target: BrowserStatePatch, source: BrowserStatePatch, key: TKey): void {
  const value = source[key];
  if (value !== undefined) {
    Object.assign(target, { [key]: value });
  }
}

function cookieKey(cookie: BrowserCookie): string {
  return [
    cookie.name,
    cookie.url ?? cookie.domain ?? '',
    cookie.path ?? '/',
  ].join('\0');
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

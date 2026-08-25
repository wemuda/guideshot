import type { VariantValue } from '@guideshot/schema';

import { createCaptureHash, createCompositionHash } from './canonical.js';
import type {
  CaptureIntent,
  CaptureProfile,
  CompositionIntent,
  GuideShotConfig,
  Plan,
  PlannedJob,
  RecipeSource,
} from './contracts.js';
import { discoverRecipes, assertUniqueRecipeIds } from './discovery.js';
import { GuideShotError } from './diagnostics.js';
import { expandMatrix, matchesVariantFilter } from './matrix.js';
import {
  defaultProfileName,
  validateConfig,
  validateRecipeSemantics,
} from './validation.js';

export interface PlanOptions {
  ids?: readonly string[];
  tags?: readonly string[];
  variants?: Readonly<Record<string, VariantValue>>;
}

export async function planProject(
  config: GuideShotConfig,
  projectRoot: string,
  options: PlanOptions = {},
): Promise<Plan> {
  const recipes = await discoverRecipes(config, projectRoot);
  return planRecipes(config, recipes, options);
}

export function planRecipes(
  config: GuideShotConfig,
  sources: readonly RecipeSource[],
  options: PlanOptions = {},
): Plan {
  validateConfig(config);
  assertUniqueRecipeIds(sources);

  const jobs: PlannedJob[] = [];
  for (const source of sources) {
    validateRecipeSemantics(source, config);
    if (!recipeSelected(source, options)) {
      continue;
    }

    const recipe = source.recipe;
    const profileName = recipe.profile ?? defaultProfileName(config);
    const profile = resolveProfile(
      config.profiles[profileName],
      recipe.capture?.pixelRatio,
    );
    for (const row of expandMatrix(recipe.matrix)) {
      if (
        options.variants !== undefined &&
        !matchesVariantFilter(row.values, options.variants)
      ) {
        continue;
      }

      const dimensionVersions = Object.fromEntries(
        Object.keys(row.values)
          .sort(compareStrings)
          .map((dimension) => [
            dimension,
            requiredDimensionVersion(config, dimension, recipe.id),
          ]),
      );
      const scenario =
        recipe.scenario === undefined
          ? undefined
          : config.scenarios?.[recipe.scenario.use];

      const captureIntent: CaptureIntent = {
        recipeId: recipe.id,
        profile: profileName,
        serverUrl: config.server.url,
        targetAttribute: config.targetAttribute ?? 'data-guide-target',
        variants: row.values,
        page: recipe.page,
        profileConfig: profile,
        dimensionVersions,
        driver: { name: config.driver.name, version: config.driver.version },
        ...(recipe.scenario === undefined ? {} : { scenario: recipe.scenario }),
        ...(recipe.prepare === undefined ? {} : { prepare: recipe.prepare }),
        ...(recipe.ready === undefined ? {} : { ready: recipe.ready }),
        ...(recipe.capture === undefined ? {} : { capture: recipe.capture }),
        ...(scenario === undefined
          ? {}
          : {
              scenarioVersion: scenario.version,
              ...(scenario.datasetRevision === undefined
                ? {}
                : { datasetRevision: scenario.datasetRevision }),
            }),
        ...(config.translations === undefined
          ? {}
          : { translationVersion: config.translations.version }),
      };
      const compositionIntent: Omit<CompositionIntent, 'sceneHash'> = {
        accessibility: recipe.accessibility,
        renderer: {
          name: config.renderer.name,
          version: config.renderer.version,
        },
        ...(recipe.annotations === undefined
          ? {}
          : { annotations: recipe.annotations }),
        ...(recipe.output === undefined ? {} : { output: recipe.output }),
        ...(config.translations === undefined
          ? {}
          : { translationVersion: config.translations.version }),
      };

      jobs.push({
        key: `${recipe.id}::${row.key}`,
        recipeId: recipe.id,
        recipeFile: source.file,
        profile: profileName,
        variantKey: row.key,
        variants: row.values,
        captureKey: createCaptureHash(captureIntent),
        captureIntent,
        compositionIntent,
        recipe,
      });
    }
  }

  jobs.sort((left, right) => compareStrings(left.key, right.key));
  assertUniqueJobKeys(jobs);
  return { jobs, recipes: [...sources] };
}

export function createJobCompositionHash(
  job: Pick<PlannedJob, 'compositionIntent'>,
  sceneHash: string,
): string {
  return createCompositionHash({
    ...job.compositionIntent,
    sceneHash,
  } satisfies CompositionIntent);
}

function recipeSelected(source: RecipeSource, options: PlanOptions): boolean {
  if (options.ids !== undefined && !options.ids.includes(source.recipe.id)) {
    return false;
  }
  if (
    options.tags !== undefined &&
    !options.tags.every((tag) => source.recipe.tags?.includes(tag) === true)
  ) {
    return false;
  }
  return true;
}

function resolveProfile(
  profile: CaptureProfile | undefined,
  pixelRatio: number | undefined,
): CaptureProfile {
  if (profile === undefined) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      'The selected capture profile is not registered.',
    );
  }
  return {
    ...profile,
    ...(pixelRatio === undefined ? {} : { pixelRatio }),
  };
}

function requiredDimensionVersion(
  config: GuideShotConfig,
  dimension: string,
  recipeId: string,
): string {
  const definition = config.dimensions?.[dimension];
  if (definition === undefined) {
    throw new GuideShotError(
      'EXTENSION_NOT_REGISTERED',
      `Recipe "${recipeId}" references unknown dimension "${dimension}".`,
      { recipeId, details: { dimension } },
    );
  }
  return definition.version;
}

function assertUniqueJobKeys(jobs: readonly PlannedJob[]): void {
  const seen = new Set<string>();
  for (const job of jobs) {
    if (seen.has(job.key)) {
      throw new GuideShotError(
        'OUTPUT_COLLISION',
        `More than one capture job resolves to "${job.key}".`,
        { recipeId: job.recipeId, jobKey: job.key },
      );
    }
    seen.add(job.key);
  }
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

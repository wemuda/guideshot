import manifestJson from '@/public/generated/guideshot/manifest.json';
import createRecipe from '@/shots/release.create.shot.json';
import publishRecipe from '@/shots/release.publish.shot.json';
import reviewRecipe from '@/shots/release.review.shot.json';

import type {
  RecipeExampleDefinition,
  RecipeExampleStep,
} from '@/components/recipe-example';
import {
  RELEASE_GUIDE_ENTRY_IDS,
  releaseGuideCopy,
  releaseGuideLocales,
} from '@/lib/generated-guide';
import { highlightCode } from '@/lib/highlight-code';

const recipeSources = [
  {
    id: 'release.create',
    title: 'Create',
    source: createRecipe,
  },
  {
    id: 'release.review',
    title: 'Review',
    source: reviewRecipe,
  },
  {
    id: 'release.publish',
    title: 'Publish',
    source: publishRecipe,
  },
] as const;

function createStep(id: (typeof RELEASE_GUIDE_ENTRY_IDS)[number]) {
  const entry = manifestJson.entries.find((item) => item.id === id);
  const variants = Object.fromEntries(
    Object.entries(
      (entry?.variants ?? {}) as Readonly<
        Record<string, RecipeExampleStep['variants'][string]>
      >,
    ).map(([key, variant]) => [
      key,
      {
        ...variant,
        src: `/generated/guideshot/${variant.src.replace(/^\.\//, '')}`,
      },
    ]),
  );
  const content = Object.fromEntries(
    releaseGuideLocales.map((locale) => [
      locale,
      {
        title: releaseGuideCopy[locale].steps[id],
        description: releaseGuideCopy[locale].descriptions[id],
        instructions: releaseGuideCopy[locale].instructions[id],
      },
    ]),
  );

  return { id, variants, content } satisfies RecipeExampleStep;
}

export async function createLocalizationThemesExample() {
  const recipes = await Promise.all(
    recipeSources.map(async (recipe) => ({
      ...recipe,
      highlightedSource: await highlightCode(
        JSON.stringify(recipe.source, null, 2),
        'json',
      ),
    })),
  );

  return {
    id: 'localization-themes',
    title: 'Localization and themes',
    description:
      'One connected guide expands into every declared language and color scheme. Change a matrix property to switch the published artifacts without recapturing the page.',
    context:
      'A three-step release flow captured from the same product workspace.',
    proof:
      'One recipe matrix publishes every requested language and color scheme.',
    changes:
      'The product copy, annotation copy, alt text, and theme change together.',
    recipes,
    properties: [
      {
        id: 'locale',
        label: 'Language',
        control: 'select',
        defaultValue: 'en',
        options: [
          { value: 'en', label: 'English' },
          { value: 'da', label: 'Dansk' },
          { value: 'nb', label: 'Norsk bokmål' },
        ],
      },
      {
        id: 'theme',
        label: 'Theme',
        control: 'tabs',
        defaultValue: 'light',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
      },
    ],
    steps: RELEASE_GUIDE_ENTRY_IDS.map(createStep),
    contentProperty: 'locale',
    defaultStep: 1,
  } satisfies RecipeExampleDefinition;
}

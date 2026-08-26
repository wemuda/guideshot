import { describe, expect, it } from 'vitest';

import { createLocalizationThemesExample } from '../examples/localization-themes-example';
import {
  createReferenceExamples,
  createStoryShowcaseExamples,
} from '../examples/showcase-examples';

describe('reusable recipe example', () => {
  it('describes recipes, properties, copy, and generated variants as data', async () => {
    const example = await createLocalizationThemesExample();

    expect(example.recipes).toHaveLength(3);
    expect(example.properties.map((property) => property.id)).toEqual([
      'locale',
      'theme',
    ]);
    expect(example.steps).toHaveLength(3);

    for (const step of example.steps) {
      expect(Object.keys(step.variants)).toHaveLength(6);
      expect(Object.keys(step.content)).toEqual(['en', 'da', 'nb']);
    }
  });

  it('pre-renders every JSON recipe with dual-theme Shiki tokens', async () => {
    const example = await createLocalizationThemesExample();

    for (const recipe of example.recipes) {
      expect(recipe.highlightedSource).toContain('shiki-themes');
      expect(recipe.highlightedSource).toContain('--shiki-light');
      expect(recipe.highlightedSource).toContain('--shiki-dark');
      expect(recipe.highlightedSource).toContain('"$schema"');
    }
  });

  it('publishes six outcome-led showcase stories from reusable definitions', async () => {
    const examples = await createStoryShowcaseExamples();

    expect(examples).toHaveLength(6);
    expect(
      examples.reduce((count, example) => count + example.recipes.length, 0),
    ).toBe(18);
    expect(
      examples.reduce(
        (count, example) =>
          count +
          example.steps.reduce(
            (variantCount, step) =>
              variantCount + Object.keys(step.variants).length,
            0,
          ),
        0,
      ),
    ).toBe(27);

    for (const example of examples) {
      expect(example.context.length).toBeGreaterThan(20);
      expect(example.proof.length).toBeGreaterThan(20);
      expect(example.changes.length).toBeGreaterThan(20);
    }

    const responsive = examples.find(
      (example) => example.id === 'responsive-profiles',
    );
    expect(
      responsive?.steps.map((step) => step.variants.default),
    ).toMatchObject([
      { width: 1920, height: 1080 },
      { width: 1600, height: 1200 },
      { width: 1080, height: 1920 },
    ]);

    const matrix = examples.find((example) => example.id === 'audience-matrix');
    expect(matrix?.properties.map((property) => property.id)).toEqual([
      'feature',
      'plan',
      'role',
    ]);
    expect(Object.keys(matrix?.steps[0]?.variants ?? {})).toHaveLength(6);
  });

  it('keeps primitive, connector, and emphasis details in the reference catalog', async () => {
    const examples = await createReferenceExamples();

    expect(examples.map((example) => example.id)).toEqual([
      'annotation-primitives',
      'connector-anchors',
      'emphasis-composition',
    ]);
    expect(
      examples[0]?.steps.map((step) => step.content.default.title),
    ).toEqual([
      'Callout',
      'Arrow',
      'Spotlight',
      'Outline',
      'Marker',
      'Label',
      'Redaction',
    ]);
  });
});

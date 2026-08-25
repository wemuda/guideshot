import { describe, expect, it } from 'vitest';

import manifestJson from '../public/generated/guideshot/manifest.json';
import createRecipe from '../shots/pilot.recipes.create.shot.json';
import signIn from '../shots/pilot.sign-in.email.shot.json';
import {
  DEMO_GUIDE_ENTRY_IDS,
  selectDemoGuideSlides,
} from '../lib/generated-guide';

const locales = ['en', 'da', 'nb'] as const;
const themes = ['light', 'dark'] as const;
const combinations = locales.flatMap((locale) =>
  themes.map((theme) => [locale, theme] as const),
);

describe('compiled demo guide', () => {
  it.each(combinations)(
    'selects the complete %s/%s guide without fallback',
    (locale, theme) => {
      const selection = selectDemoGuideSlides(manifestJson, locale, theme);

      expect(selection.variantKey).toBe(`locale=${locale};theme=${theme}`);
      expect(selection.missingEntryIds).toEqual([]);
      expect(selection.slides.map((slide) => slide.id)).toEqual(
        DEMO_GUIDE_ENTRY_IDS,
      );

      for (const slide of selection.slides) {
        expect(slide.alt.length).toBeGreaterThan(0);
        expect(slide.src).toContain(`.locale-${locale}-theme-${theme}.`);
      }
    },
  );

  it('reports missing variants instead of crossing locale or theme boundaries', () => {
    const selection = selectDemoGuideSlides({ entries: [] }, 'da', 'dark');

    expect(selection.slides).toEqual([]);
    expect(selection.missingEntryIds).toEqual(DEMO_GUIDE_ENTRY_IDS);
  });

  it('keeps recipe matrices aligned with every supported demo preference', () => {
    expect(createRecipe.matrix.dimensions.locale).toEqual(locales);
    expect(createRecipe.matrix.dimensions.theme).toEqual(themes);
    expect(signIn.matrix.dimensions.locale).toEqual(locales);
    expect(signIn.matrix.dimensions.theme).toEqual(themes);
  });

  it('publishes two guide steps across all six preference combinations', () => {
    expect(manifestJson.entries).toHaveLength(DEMO_GUIDE_ENTRY_IDS.length);
    expect(
      manifestJson.entries.reduce(
        (count, entry) => count + Object.keys(entry.variants).length,
        0,
      ),
    ).toBe(DEMO_GUIDE_ENTRY_IDS.length * locales.length * themes.length);
  });
});

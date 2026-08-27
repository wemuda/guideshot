import { describe, expect, it } from 'vitest';

import manifestJson from '../public/generated/guideshot/manifest.json';
import createRelease from '../shots/release.create.shot.json';
import createReleaseMobile from '../shots/release.create.mobile.shot.json';
import publishRelease from '../shots/release.publish.shot.json';
import publishReleaseMobile from '../shots/release.publish.mobile.shot.json';
import reviewRelease from '../shots/release.review.shot.json';
import reviewReleaseMobile from '../shots/release.review.mobile.shot.json';
import {
  RELEASE_GUIDE_ENTRY_IDS,
  RELEASE_GUIDE_MOBILE_ENTRY_IDS,
  normalizeGeneratedManifest,
  selectReleaseGuideSlides,
} from '../lib/generated-guide';

const generatedManifest = normalizeGeneratedManifest(manifestJson);

const locales = ['en', 'da', 'nb'] as const;
const themes = ['light', 'dark'] as const;
const combinations = locales.flatMap((locale) =>
  themes.map((theme) => [locale, theme] as const),
);
const recipes = [createRelease, reviewRelease, publishRelease];
const mobileRecipes = [
  createReleaseMobile,
  reviewReleaseMobile,
  publishReleaseMobile,
];

describe('compiled release guide', () => {
  it.each(combinations)(
    'selects the complete %s/%s guide without fallback',
    (locale, theme) => {
      const selection = selectReleaseGuideSlides(
        generatedManifest,
        locale,
        theme,
      );

      expect(selection.variantKey).toBe(`locale=${locale};theme=${theme}`);
      expect(selection.missingEntryIds).toEqual([]);
      expect(selection.slides.map((slide) => slide.id)).toEqual(
        RELEASE_GUIDE_ENTRY_IDS,
      );

      for (const slide of selection.slides) {
        expect(slide.alt.length).toBeGreaterThan(0);
        expect(slide.src).toContain(`.locale-${locale}-theme-${theme}.`);
      }
    },
  );

  it.each(combinations)(
    'selects the complete mobile %s/%s guide without fallback',
    (locale, theme) => {
      const selection = selectReleaseGuideSlides(
        generatedManifest,
        locale,
        theme,
        'mobile',
      );

      expect(selection.missingEntryIds).toEqual([]);
      expect(selection.slides.map((slide) => slide.id)).toEqual(
        RELEASE_GUIDE_ENTRY_IDS,
      );

      for (const slide of selection.slides) {
        expect(slide.width).toBe(1080);
        expect(slide.height).toBeGreaterThan(slide.width);
        expect(slide.src).toContain(`.mobile.locale-${locale}-theme-${theme}.`);
      }
    },
  );

  it('reports missing variants instead of crossing locale or theme boundaries', () => {
    const selection = selectReleaseGuideSlides({ entries: [] }, 'da', 'dark');

    expect(selection.slides).toEqual([]);
    expect(selection.missingEntryIds).toEqual(RELEASE_GUIDE_ENTRY_IDS);
  });

  it('keeps every recipe matrix aligned with supported preferences', () => {
    for (const recipe of [...recipes, ...mobileRecipes]) {
      expect(recipe.matrix.dimensions.locale).toEqual(locales);
      expect(recipe.matrix.dimensions.theme).toEqual(themes);
    }
  });

  it('uses explicit mobile capture profiles for the compact guide', () => {
    for (const recipe of mobileRecipes) {
      expect(recipe.profile).toBe('guide.mobile');
      expect(recipe.output).toMatchObject({ width: 1080 });
      expect(recipe.output).not.toHaveProperty('height');
    }
  });

  it('publishes three connected steps across all six preference combinations', () => {
    const releaseEntries = manifestJson.entries.filter((entry) =>
      RELEASE_GUIDE_ENTRY_IDS.includes(
        entry.id as (typeof RELEASE_GUIDE_ENTRY_IDS)[number],
      ),
    );

    expect(releaseEntries).toHaveLength(RELEASE_GUIDE_ENTRY_IDS.length);
    expect(
      releaseEntries.reduce(
        (count, entry) => count + Object.keys(entry.variants).length,
        0,
      ),
    ).toBe(RELEASE_GUIDE_ENTRY_IDS.length * locales.length * themes.length);
  });

  it('publishes every mobile step across all six preference combinations', () => {
    const releaseEntries = manifestJson.entries.filter((entry) =>
      RELEASE_GUIDE_MOBILE_ENTRY_IDS.includes(
        entry.id as (typeof RELEASE_GUIDE_MOBILE_ENTRY_IDS)[number],
      ),
    );

    expect(releaseEntries).toHaveLength(RELEASE_GUIDE_MOBILE_ENTRY_IDS.length);
    expect(
      releaseEntries.reduce(
        (count, entry) => count + Object.keys(entry.variants).length,
        0,
      ),
    ).toBe(
      RELEASE_GUIDE_MOBILE_ENTRY_IDS.length * locales.length * themes.length,
    );
  });
});

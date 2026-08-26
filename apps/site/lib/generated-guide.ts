export const RELEASE_GUIDE_ENTRY_IDS = [
  'release.create',
  'release.review',
  'release.publish',
] as const;

export const releaseGuideLocales = ['en', 'da', 'nb'] as const;
export const releaseGuideThemes = ['light', 'dark'] as const;

export type ReleaseGuideEntryId = (typeof RELEASE_GUIDE_ENTRY_IDS)[number];
export type ReleaseGuideLocale = (typeof releaseGuideLocales)[number];
export type ReleaseGuideTheme = (typeof releaseGuideThemes)[number];

interface GeneratedVariant {
  readonly alt: string;
  readonly height: number;
  readonly src: string;
  readonly width: number;
}

interface GeneratedEntry {
  readonly id: string;
  readonly variants: Readonly<Record<string, GeneratedVariant>>;
}

export interface GeneratedManifest {
  readonly entries: readonly GeneratedEntry[];
}

export function normalizeGeneratedManifest(manifest: {
  readonly entries: readonly {
    readonly id: string;
    readonly variants: object;
  }[];
}): GeneratedManifest {
  return {
    entries: manifest.entries.map((entry) => ({
      id: entry.id,
      variants: Object.fromEntries(
        Object.entries(entry.variants).filter(
          (item): item is [string, GeneratedVariant] => item[1] !== undefined,
        ),
      ),
    })),
  };
}

export interface ReleaseGuideSlide extends GeneratedVariant {
  readonly id: ReleaseGuideEntryId;
  readonly src: string;
}

export interface ReleaseGuideSelection {
  readonly missingEntryIds: readonly ReleaseGuideEntryId[];
  readonly slides: readonly ReleaseGuideSlide[];
  readonly variantKey: string;
}

export const releaseGuideCopy = {
  en: {
    guideLabel: 'Try the guide',
    guideTitle: 'Ship a release',
    language: 'Language',
    previous: 'Previous step',
    next: 'Next step',
    theme: 'Theme',
    steps: {
      'release.create': 'Create release',
      'release.review': 'Review changes',
      'release.publish': 'Publish notes',
    },
    descriptions: {
      'release.create': 'Start from the Releases page with one clear action.',
      'release.review':
        'Set the version, target, and notes before anything is published.',
      'release.publish': 'Check the final summary, then publish the release.',
    },
    instructions: {
      'release.create': ['Open Releases', 'Choose Create release'],
      'release.review': ['Add the release details', 'Review the release notes'],
      'release.publish': ['Confirm the summary', 'Publish the release'],
    },
  },
  da: {
    guideLabel: 'Prøv guiden',
    guideTitle: 'Udgiv en version',
    language: 'Sprog',
    previous: 'Forrige trin',
    next: 'Næste trin',
    theme: 'Tema',
    steps: {
      'release.create': 'Opret udgivelse',
      'release.review': 'Gennemgå ændringer',
      'release.publish': 'Udgiv noter',
    },
    descriptions: {
      'release.create': 'Start på siden Udgivelser med én tydelig handling.',
      'release.review':
        'Angiv version, mål og noter, før noget bliver udgivet.',
      'release.publish':
        'Tjek det endelige overblik, og udgiv derefter versionen.',
    },
    instructions: {
      'release.create': ['Åbn Udgivelser', 'Vælg Opret udgivelse'],
      'release.review': ['Tilføj udgivelsesdetaljer', 'Gennemgå noterne'],
      'release.publish': ['Bekræft overblikket', 'Udgiv versionen'],
    },
  },
  nb: {
    guideLabel: 'Prøv veiledningen',
    guideTitle: 'Publiser en versjon',
    language: 'Språk',
    previous: 'Forrige trinn',
    next: 'Neste trinn',
    theme: 'Tema',
    steps: {
      'release.create': 'Opprett utgivelse',
      'release.review': 'Gjennomgå endringer',
      'release.publish': 'Publiser notater',
    },
    descriptions: {
      'release.create': 'Start på Utgivelser-siden med én tydelig handling.',
      'release.review': 'Angi versjon, mål og notater før noe blir publisert.',
      'release.publish':
        'Kontroller sammendraget, og publiser deretter utgivelsen.',
    },
    instructions: {
      'release.create': ['Åpne Utgivelser', 'Velg Opprett utgivelse'],
      'release.review': ['Legg til utgivelsesdetaljer', 'Gjennomgå notatene'],
      'release.publish': ['Bekreft sammendraget', 'Publiser utgivelsen'],
    },
  },
} as const;

export function isReleaseGuideLocale(
  value: string | null,
): value is ReleaseGuideLocale {
  return releaseGuideLocales.includes(value as ReleaseGuideLocale);
}

export function isReleaseGuideTheme(
  value: string | undefined,
): value is ReleaseGuideTheme {
  return releaseGuideThemes.includes(value as ReleaseGuideTheme);
}

export function selectReleaseGuideSlides(
  manifest: GeneratedManifest,
  locale: ReleaseGuideLocale,
  theme: ReleaseGuideTheme,
): ReleaseGuideSelection {
  const variantKey = `locale=${locale};theme=${theme}`;
  const missingEntryIds: ReleaseGuideEntryId[] = [];
  const slides: ReleaseGuideSlide[] = [];

  for (const id of RELEASE_GUIDE_ENTRY_IDS) {
    const variant = manifest.entries.find((entry) => entry.id === id)?.variants[
      variantKey
    ];

    if (variant === undefined) {
      missingEntryIds.push(id);
      continue;
    }

    slides.push({
      ...variant,
      id,
      src: `/generated/guideshot/${variant.src.replace(/^\.\//, '')}`,
    });
  }

  return { missingEntryIds, slides, variantKey };
}

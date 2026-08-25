import type { DemoLocale, DemoTheme } from './demo';

export const DEMO_GUIDE_ENTRY_IDS = [
  'pilot.sign-in.email',
  'pilot.recipes.create',
] as const;

export type DemoGuideEntryId = (typeof DEMO_GUIDE_ENTRY_IDS)[number];

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

export interface DemoGuideSlide extends GeneratedVariant {
  readonly id: DemoGuideEntryId;
  readonly src: string;
}

export interface DemoGuideSelection {
  readonly missingEntryIds: readonly DemoGuideEntryId[];
  readonly slides: readonly DemoGuideSlide[];
  readonly variantKey: string;
}

export function selectDemoGuideSlides(
  manifest: GeneratedManifest,
  locale: DemoLocale,
  theme: DemoTheme,
): DemoGuideSelection {
  const variantKey = `locale=${locale};theme=${theme}`;
  const missingEntryIds: DemoGuideEntryId[] = [];
  const slides: DemoGuideSlide[] = [];

  for (const id of DEMO_GUIDE_ENTRY_IDS) {
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

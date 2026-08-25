export const DEMO_EMAIL = 'demo@guideshot.dev';
export const DEMO_SESSION_KEY = 'guideshot:demo-session';
export const DEMO_LOCALE_KEY = 'guideshot:locale';
export const DEMO_THEME_KEY = 'guideshot:theme';

export type DemoLocale = 'en' | 'da' | 'nb';
export type DemoTheme = 'light' | 'dark';

export const demoCopy = {
  en: {
    recipes: 'Recipes',
    recipesDescription: 'Capture-ready visual states for product guidance.',
    newRecipe: 'New recipe',
    name: 'Name',
    scenario: 'Scenario',
    variants: 'Variants',
    status: 'Status',
    ready: 'Ready',
    draft: 'Draft',
    createTitle: 'Create a recipe',
    createDescription: 'Describe the app state GuideShot should reproduce.',
    recipeName: 'Recipe name',
    pagePath: 'Page path',
    scenarioLabel: 'Scenario',
    matrix: 'Matrix',
    cancel: 'Cancel',
    create: 'Create recipe',
  },
  da: {
    recipes: 'Opskrifter',
    recipesDescription: 'Skærmtilstande klar til produktvejledninger.',
    newRecipe: 'Ny opskrift',
    name: 'Navn',
    scenario: 'Scenarie',
    variants: 'Varianter',
    status: 'Status',
    ready: 'Klar',
    draft: 'Kladde',
    createTitle: 'Opret en opskrift',
    createDescription: 'Beskriv den apptilstand, GuideShot skal genskabe.',
    recipeName: 'Opskriftens navn',
    pagePath: 'Sidens sti',
    scenarioLabel: 'Scenarie',
    matrix: 'Matrix',
    cancel: 'Annuller',
    create: 'Opret opskrift',
  },
  nb: {
    recipes: 'Oppskrifter',
    recipesDescription: 'Skjermtilstander klare for produktveiledning.',
    newRecipe: 'Ny oppskrift',
    name: 'Navn',
    scenario: 'Scenario',
    variants: 'Varianter',
    status: 'Status',
    ready: 'Klar',
    draft: 'Utkast',
    createTitle: 'Opprett en oppskrift',
    createDescription: 'Beskriv apptilstanden GuideShot skal gjenskape.',
    recipeName: 'Navn på oppskrift',
    pagePath: 'Sidesti',
    scenarioLabel: 'Scenario',
    matrix: 'Matrise',
    cancel: 'Avbryt',
    create: 'Opprett oppskrift',
  },
} as const;

export function isDemoLocale(value: string | null): value is DemoLocale {
  return value === 'en' || value === 'da' || value === 'nb';
}

export function isDemoTheme(value: string | null): value is DemoTheme {
  return value === 'light' || value === 'dark';
}

export function hasDemoSession(storage: Storage): boolean {
  try {
    const value: unknown = JSON.parse(storage.getItem(DEMO_SESSION_KEY) ?? 'null');
    return (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      value.version === 1 &&
      'userId' in value &&
      value.userId === 'demo-admin'
    );
  } catch {
    return false;
  }
}

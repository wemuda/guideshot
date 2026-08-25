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
    overview: 'Overview',
    collections: 'Collections',
    settings: 'Settings',
    docsWorkspace: 'Docs workspace',
    captureFixture: 'Capture fixture',
    deterministicFixture: 'Deterministic local fixture',
    schemaVersion: 'Schema version 1',
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
    rowCreateWorkspace: 'Create a workspace',
    rowInviteTeammate: 'Invite a teammate',
    rowBilling: 'Update billing details',
    authenticatedAdmin: 'Authenticated admin',
    authenticatedOwner: 'Authenticated owner',
    matrixSummary: '3 locales × 2 themes = 6 variants',
    fixedFixtureData:
      'Fixed fixture data · no network requests · no timestamps',
    exitPilot: 'Exit pilot',
    authBadge: 'GuideShot Studio · Pilot fixture',
    authHeadline: 'A real app state, made safe to reproduce.',
    authIntro:
      'This small workspace proves that authentication and application state can stay in a typed adapter—never in the recipe.',
    authPromises: [
      'Deterministic state',
      'Stable DOM targets',
      'No live customer data',
    ],
    authSignInTitle: 'Sign in to the demo workspace',
    authSignInDescription:
      'Use the deterministic account to explore a capture-ready authenticated state.',
    authWorkEmail: 'Work email',
    authInvalidEmail: 'Use the deterministic account',
    authContinue: 'Continue',
    authUseDemoAccount: 'Use demo account',
    authPrivacy: 'No credentials leave this browser.',
    help: 'Help',
    helpTitle: 'GuideShot Help',
    helpDescription:
      'Follow the compiled guide for this language and color theme.',
    helpUnavailable: 'This guide variant has not been compiled yet.',
    previous: 'Previous',
    next: 'Next',
    done: 'Done',
    step: 'Step',
    close: 'Close',
    openFullSize: 'Open full size',
    useDarkTheme: 'Use dark theme',
    useLightTheme: 'Use light theme',
    language: 'Language',
  },
  da: {
    recipes: 'Opskrifter',
    recipesDescription: 'Skærmtilstande klar til produktvejledninger.',
    overview: 'Overblik',
    collections: 'Samlinger',
    settings: 'Indstillinger',
    docsWorkspace: 'Dokumentationsområde',
    captureFixture: 'Skærmbilledefixture',
    deterministicFixture: 'Deterministisk lokal fixture',
    schemaVersion: 'Skemaversion 1',
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
    rowCreateWorkspace: 'Opret et arbejdsområde',
    rowInviteTeammate: 'Inviter en kollega',
    rowBilling: 'Opdater betalingsoplysninger',
    authenticatedAdmin: 'Godkendt administrator',
    authenticatedOwner: 'Godkendt ejer',
    matrixSummary: '3 sprog × 2 temaer = 6 varianter',
    fixedFixtureData:
      'Faste fixturedata · ingen netværkskald · ingen tidsstempler',
    exitPilot: 'Forlad pilot',
    authBadge: 'GuideShot Studio · Pilotfixture',
    authHeadline: 'En virkelig apptilstand, gjort sikker at genskabe.',
    authIntro:
      'Dette lille arbejdsområde viser, at godkendelse og apptilstand kan blive i en typet adapter—aldrig i opskriften.',
    authPromises: [
      'Deterministisk tilstand',
      'Stabile DOM-mål',
      'Ingen rigtige kundedata',
    ],
    authSignInTitle: 'Log ind på demoarbejdsområdet',
    authSignInDescription:
      'Brug den deterministiske konto til at udforske en godkendt tilstand klar til skærmbilleder.',
    authWorkEmail: 'Arbejdsmail',
    authInvalidEmail: 'Brug den deterministiske konto',
    authContinue: 'Fortsæt',
    authUseDemoAccount: 'Brug demokonto',
    authPrivacy: 'Ingen loginoplysninger forlader browseren.',
    help: 'Hjælp',
    helpTitle: 'GuideShot-hjælp',
    helpDescription:
      'Følg den kompilerede guide på dette sprog og i dette farvetema.',
    helpUnavailable: 'Denne guidevariant er ikke kompileret endnu.',
    previous: 'Forrige',
    next: 'Næste',
    done: 'Færdig',
    step: 'Trin',
    close: 'Luk',
    openFullSize: 'Åbn i fuld størrelse',
    useDarkTheme: 'Brug mørkt tema',
    useLightTheme: 'Brug lyst tema',
    language: 'Sprog',
  },
  nb: {
    recipes: 'Oppskrifter',
    recipesDescription: 'Skjermtilstander klare for produktveiledning.',
    overview: 'Oversikt',
    collections: 'Samlinger',
    settings: 'Innstillinger',
    docsWorkspace: 'Dokumentasjonsområde',
    captureFixture: 'Skjermbildefikstur',
    deterministicFixture: 'Deterministisk lokal fikstur',
    schemaVersion: 'Skjemaversjon 1',
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
    rowCreateWorkspace: 'Opprett et arbeidsområde',
    rowInviteTeammate: 'Inviter en kollega',
    rowBilling: 'Oppdater betalingsdetaljer',
    authenticatedAdmin: 'Autentisert administrator',
    authenticatedOwner: 'Autentisert eier',
    matrixSummary: '3 språk × 2 temaer = 6 varianter',
    fixedFixtureData:
      'Faste fiksturdata · ingen nettverkskall · ingen tidsstempler',
    exitPilot: 'Forlat pilot',
    authBadge: 'GuideShot Studio · Pilotfikstur',
    authHeadline: 'En ekte apptilstand, gjort trygg å gjenskape.',
    authIntro:
      'Dette lille arbeidsområdet viser at autentisering og apptilstand kan bli i en typet adapter—aldri i oppskriften.',
    authPromises: [
      'Deterministisk tilstand',
      'Stabile DOM-mål',
      'Ingen ekte kundedata',
    ],
    authSignInTitle: 'Logg inn på demoarbeidsområdet',
    authSignInDescription:
      'Bruk den deterministiske kontoen for å utforske en autentisert tilstand klar for skjermbilder.',
    authWorkEmail: 'Jobb-e-post',
    authInvalidEmail: 'Bruk den deterministiske kontoen',
    authContinue: 'Fortsett',
    authUseDemoAccount: 'Bruk demokonto',
    authPrivacy: 'Ingen innloggingsopplysninger forlater nettleseren.',
    help: 'Hjelp',
    helpTitle: 'GuideShot-hjelp',
    helpDescription:
      'Følg den kompilerte veiledningen for dette språket og fargetemaet.',
    helpUnavailable: 'Denne veiledningsvarianten er ikke kompilert ennå.',
    previous: 'Forrige',
    next: 'Neste',
    done: 'Ferdig',
    step: 'Trinn',
    close: 'Lukk',
    openFullSize: 'Åpne i full størrelse',
    useDarkTheme: 'Bruk mørkt tema',
    useLightTheme: 'Bruk lyst tema',
    language: 'Språk',
  },
} as const;

export const demoGuideCopy = {
  en: {
    'pilot.sign-in.email': {
      title: 'Sign in with the demo account',
      description: 'Start from a safe, deterministic authenticated state.',
    },
    'pilot.recipes.create': {
      title: 'Create your first recipe',
      description: 'Name the visual state GuideShot should reproduce.',
    },
  },
  da: {
    'pilot.sign-in.email': {
      title: 'Log ind med demokontoen',
      description: 'Start fra en sikker og deterministisk godkendt tilstand.',
    },
    'pilot.recipes.create': {
      title: 'Opret din første opskrift',
      description: 'Navngiv den visuelle tilstand, GuideShot skal genskabe.',
    },
  },
  nb: {
    'pilot.sign-in.email': {
      title: 'Logg inn med demokontoen',
      description: 'Start fra en trygg og deterministisk autentisert tilstand.',
    },
    'pilot.recipes.create': {
      title: 'Opprett din første oppskrift',
      description:
        'Gi navn til den visuelle tilstanden GuideShot skal gjenskape.',
    },
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
    const value: unknown = JSON.parse(
      storage.getItem(DEMO_SESSION_KEY) ?? 'null',
    );
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

export type ThemeMode = 'light' | 'dark';

export interface AnnotationTheme {
  readonly mode: ThemeMode;
  readonly fontFamily: string;
  readonly foreground: string;
  readonly surface: string;
  readonly surfaceBorder: string;
  readonly accent: string;
  readonly accentContrast: string;
  readonly scrim: string;
  readonly redaction: string;
  readonly shadow: string;
}

const LIGHT_THEME: AnnotationTheme = {
  mode: 'light',
  fontFamily: '"GuideShot Inter", sans-serif',
  foreground: '#f8fafc',
  surface: '#172033',
  surfaceBorder: 'rgba(255,255,255,0.16)',
  accent: '#1748e6',
  accentContrast: '#ffffff',
  scrim: 'rgba(15,23,42,0.5)',
  redaction: '#111827',
  shadow: '0 12px 32px rgba(15,23,42,0.28)',
};

const DARK_THEME: AnnotationTheme = {
  mode: 'dark',
  fontFamily: '"GuideShot Inter", sans-serif',
  foreground: '#111827',
  surface: '#f8fafc',
  surfaceBorder: 'rgba(15,23,42,0.14)',
  accent: '#6f91ff',
  accentContrast: '#111827',
  scrim: 'rgba(2,6,23,0.62)',
  redaction: '#020617',
  shadow: '0 12px 34px rgba(0,0,0,0.42)',
};

export function resolveTheme(
  requestTheme: unknown,
  sceneTheme: unknown,
): AnnotationTheme {
  const mode = themeMode(requestTheme) ?? themeMode(sceneTheme) ?? 'light';
  return mode === 'dark' ? DARK_THEME : LIGHT_THEME;
}

function themeMode(value: unknown): ThemeMode | undefined {
  if (value === 'light' || value === 'dark') return value;
  if (value !== null && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    if (candidate.mode === 'light' || candidate.mode === 'dark')
      return candidate.mode;
    if (candidate.name === 'light' || candidate.name === 'dark')
      return candidate.name;
  }
  return undefined;
}

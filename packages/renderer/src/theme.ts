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
  foreground: '#fafafa',
  surface: '#18181b',
  surfaceBorder: 'rgba(255,255,255,0.14)',
  accent: '#1748e6',
  accentContrast: '#ffffff',
  scrim: 'rgba(0,0,0,0.46)',
  redaction: '#111111',
  shadow: '0 4px 16px rgba(0,0,0,0.24)',
};

const DARK_THEME: AnnotationTheme = {
  mode: 'dark',
  fontFamily: '"GuideShot Inter", sans-serif',
  foreground: '#18181b',
  surface: '#fafafa',
  surfaceBorder: 'rgba(0,0,0,0.12)',
  accent: '#6f91ff',
  accentContrast: '#111827',
  scrim: 'rgba(0,0,0,0.4)',
  redaction: '#000000',
  shadow: '0 4px 18px rgba(0,0,0,0.32)',
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

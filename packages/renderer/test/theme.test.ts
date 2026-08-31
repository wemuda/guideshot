import { describe, expect, it } from 'vitest';

import { resolveTheme } from '../src/theme.js';

describe('annotation themes', () => {
  it('uses neutral light-scene surfaces and scrim', () => {
    expect(resolveTheme('light', undefined)).toMatchObject({
      foreground: '#fafafa',
      surface: '#18181b',
      surfaceBorder: 'rgba(255,255,255,0.14)',
      scrim: 'rgba(0,0,0,0.46)',
      redaction: '#111111',
      shadow: '0 4px 16px rgba(0,0,0,0.24)',
    });
  });

  it('uses neutral dark-scene surfaces and scrim', () => {
    expect(resolveTheme('dark', undefined)).toMatchObject({
      foreground: '#18181b',
      surface: '#fafafa',
      surfaceBorder: 'rgba(0,0,0,0.12)',
      scrim: 'rgba(0,0,0,0.4)',
      redaction: '#000000',
      shadow: '0 4px 18px rgba(0,0,0,0.32)',
    });
  });
});

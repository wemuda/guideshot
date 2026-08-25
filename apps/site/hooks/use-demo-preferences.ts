'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  DEMO_LOCALE_KEY,
  DEMO_THEME_KEY,
  isDemoLocale,
  isDemoTheme,
  type DemoLocale,
  type DemoTheme,
} from '@/lib/demo';

export function useDemoPreferences() {
  const [locale, setLocaleState] = useState<DemoLocale>('en');
  const [theme, setThemeState] = useState<DemoTheme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedLocale = localStorage.getItem(DEMO_LOCALE_KEY);
    const storedTheme = localStorage.getItem(DEMO_THEME_KEY);
    const nextLocale = isDemoLocale(storedLocale) ? storedLocale : 'en';
    const nextTheme = isDemoTheme(storedTheme) ? storedTheme : 'light';

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.lang = nextLocale;
    queueMicrotask(() => {
      setLocaleState(nextLocale);
      setThemeState(nextTheme);
      setReady(true);
    });

    return () => {
      delete document.documentElement.dataset.theme;
      document.documentElement.lang = 'en';
    };
  }, []);

  const setLocale = useCallback((value: DemoLocale) => {
    localStorage.setItem(DEMO_LOCALE_KEY, value);
    document.documentElement.lang = value;
    setLocaleState(value);
  }, []);

  const setTheme = useCallback((value: DemoTheme) => {
    localStorage.setItem(DEMO_THEME_KEY, value);
    document.documentElement.dataset.theme = value;
    setThemeState(value);
  }, []);

  return { locale, ready, setLocale, setTheme, theme };
}

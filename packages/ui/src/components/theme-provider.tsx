'use client'

import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps as NextThemeProviderProps,
  useTheme as useNextTheme,
} from 'next-themes'
import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = Omit<
  NextThemeProviderProps,
  'attribute' | 'defaultTheme' | 'enableSystem' | 'storageKey' | 'themes'
> & {
  defaultTheme?: Theme
  storageKey?: string
}

function isTheme(value: string | undefined): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'guideshot-ui-theme',
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableColorScheme
      enableSystem
      storageKey={storageKey}
      themes={['light', 'dark']}
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
}

function useTheme() {
  const context = useNextTheme()
  const theme = isTheme(context.theme) ? context.theme : 'system'
  const setTheme = React.useCallback(
    (value: Theme) => context.setTheme(value),
    [context.setTheme]
  )

  return {
    ...context,
    setTheme,
    theme,
  }
}

export type { Theme, ThemeProviderProps }
export { ThemeProvider, useTheme }

'use client'

import { ComputerIcon, Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@guideshot/ui/components/icon'
import { Tabs, TabsList, TabsTrigger } from '@guideshot/ui/components/tabs'
import { type Theme, useTheme } from '@guideshot/ui/components/theme-provider'
import { cn } from '@guideshot/ui/lib/utils'

type ThemeSelectorLabels = Record<Theme, string>

type ThemeSelectorProps = {
  className?: string
  labels?: ThemeSelectorLabels
}

const defaultLabels: ThemeSelectorLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const themeOptions = [
  { icon: ComputerIcon, value: 'system' },
  { icon: Sun03Icon, value: 'light' },
  { icon: Moon02Icon, value: 'dark' },
] as const

function ThemeSelector({
  className,
  labels = defaultLabels,
}: ThemeSelectorProps) {
  const { setTheme, theme } = useTheme()

  return (
    <Tabs
      value={theme}
      onValueChange={value => setTheme(value as Theme)}
      className={cn('gap-0', className)}
    >
      <TabsList aria-label="Theme" className="h-9 w-full">
        {themeOptions.map(option => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className="min-w-0 px-1.5 text-caption"
          >
            <Icon icon={option.icon} size={12} data-icon="inline-start" />
            {labels[option.value]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export type { ThemeSelectorLabels, ThemeSelectorProps }
export { ThemeSelector }

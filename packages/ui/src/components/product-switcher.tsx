'use client'

import { Icon, type IconData } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, tabsIndicatorDuration } from './tabs'

type ProductSwitcherTone = 'blue' | 'violet' | 'teal'

type ProductSwitcherItem = {
  value: string
  label: string
  icon: IconData
  tone: ProductSwitcherTone
  disabled?: boolean
}

type ProductSwitcherProps = Omit<
  React.ComponentProps<typeof Tabs>,
  'children' | 'defaultValue' | 'onValueChange' | 'value'
> & {
  items: ProductSwitcherItem[]
  label?: string
  value: string
  onValueChange?: (value: string) => void
}

const toneClasses: Record<ProductSwitcherTone, string> = {
  blue: 'bg-[#4559e7] text-white',
  violet: 'bg-[#7827ff] text-white',
  teal: 'bg-[#087f75] text-white',
}

const navigationDelay = tabsIndicatorDuration + 40

function ProductSwitcher({
  activationMode = 'manual',
  className,
  items,
  label = 'Switch product',
  onValueChange,
  value,
  ...props
}: ProductSwitcherProps) {
  const [selectedValue, setSelectedValue] = React.useState(value)
  const navigationTimeout = React.useRef<number | null>(null)

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  React.useEffect(
    () => () => {
      if (navigationTimeout.current !== null) {
        window.clearTimeout(navigationTimeout.current)
      }
    },
    []
  )

  const handleValueChange = (nextValue: string) => {
    setSelectedValue(nextValue)

    if (navigationTimeout.current !== null) {
      window.clearTimeout(navigationTimeout.current)
    }

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : navigationDelay

    navigationTimeout.current = window.setTimeout(() => {
      navigationTimeout.current = null
      onValueChange?.(nextValue)
    }, delay)
  }

  return (
    <Tabs
      {...props}
      activationMode={activationMode}
      className={cn('w-full gap-0', className)}
      value={selectedValue}
      onValueChange={handleValueChange}
    >
      <TabsList
        aria-label={label}
        indicatorClassName="rounded-lg"
        className="grid h-auto w-full grid-cols-3 gap-1.5 rounded-xl p-1 group-data-horizontal/tabs:h-auto"
      >
        {items.map(item => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="h-auto min-w-0 flex-col gap-2 rounded-lg px-1.5 py-2 text-caption text-text-secondary hover:text-foreground"
          >
            <span
              className={cn(
                'flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary',
                toneClasses[item.tone]
              )}
            >
              <Icon icon={item.icon} size={24} />
            </span>
            <span className="w-full truncate">{item.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export type { ProductSwitcherItem, ProductSwitcherProps, ProductSwitcherTone }
export { ProductSwitcher }

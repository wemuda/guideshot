'use client'

import { Tick02Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@guideshot/ui/components/icon'

import { cn } from '@guideshot/ui/lib/utils'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-control-border bg-surface transition-colors duration-150 ease-out outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3.5 after:-inset-y-3.5 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <Icon icon={Tick02Icon} size={12} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

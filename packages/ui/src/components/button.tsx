import { cn } from '@guideshot/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-control font-medium whitespace-nowrap transition-colors duration-150 ease-out outline-none select-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [@media(pointer:coarse)]:min-h-11",
  {
    variants: {
      variant: {
        default:
          'bg-primary hover:bg-primary-hover data-[variant=default]:text-primary-foreground',
        outline:
          'border-control-border bg-surface hover:bg-accent aria-expanded:bg-accent data-[variant=outline]:text-foreground',
        secondary:
          'border-control-border bg-surface hover:bg-accent aria-expanded:bg-accent data-[variant=secondary]:text-secondary-foreground',
        ghost:
          'bg-transparent hover:bg-accent hover:text-foreground aria-expanded:bg-accent data-[variant=ghost]:text-foreground',
        destructive:
          'border-destructive/35 bg-surface hover:bg-destructive/5 focus-visible:ring-destructive data-[variant=destructive]:text-destructive',
        link: 'underline-offset-4 hover:underline data-[variant=link]:text-primary',
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-8 gap-1 rounded-md px-2 text-caption has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-2.5 text-caption has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-2 px-3.5 text-body has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 [@media(pointer:coarse)]:size-11 [&_svg:not([class*='size-'])]:size-4",
        'icon-xs':
          "size-8 rounded-md [@media(pointer:coarse)]:size-11 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          "size-8 [@media(pointer:coarse)]:size-11 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-lg':
          "size-9 [@media(pointer:coarse)]:size-11 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})

export type { ButtonProps }
export { Button, buttonVariants }

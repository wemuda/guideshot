import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-20 w-full resize-none rounded-md border border-control-border bg-surface px-2.5 py-2 text-body transition-colors duration-150 ease-out outline-none placeholder:text-text-meta motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

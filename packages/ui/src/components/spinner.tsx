import { Loading03Icon } from '@hugeicons/core-free-icons'
import { Icon, type IconSize } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'

type SpinnerProps = Omit<
  React.ComponentProps<'span'>,
  'aria-hidden' | 'aria-label' | 'children' | 'role'
> & {
  label?: string
  size?: IconSize
}

function Spinner({ className, label, size = 16, ...props }: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={cn('inline-flex shrink-0', className)}
      {...props}
    >
      <Icon icon={Loading03Icon} size={size} className="animate-spin" />
    </span>
  )
}

export type { SpinnerProps }
export { Spinner }

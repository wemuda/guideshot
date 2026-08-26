import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { cn } from '@guideshot/ui/lib/utils'
import type { CSSProperties, MouseEventHandler } from 'react'

type IconSize = 12 | 16 | 18 | 20 | 24
type IconData = IconSvgElement

const iconSizeClasses: Record<IconSize, string> = {
  12: 'size-3',
  16: 'size-4',
  18: 'size-[18px]',
  20: 'size-5',
  24: 'size-6',
}

type IconAccessibilityProps =
  | { decorative?: true; label?: never }
  | { decorative: false; label: string }

type IconStyle = Omit<CSSProperties, 'fill' | 'stroke' | 'strokeWidth'>

type IconProps = IconAccessibilityProps & {
  className?: string
  fill?: 'currentColor'
  icon: IconData
  onClick?: MouseEventHandler<SVGSVGElement>
  size?: IconSize
  style?: IconStyle
}

function Icon({
  className,
  decorative = true,
  icon,
  label,
  size = 16,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      {...props}
      className={cn(className, iconSizeClasses[size])}
      data-slot="icon"
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={1.5}
      focusable="false"
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      role={decorative ? undefined : 'img'}
    />
  )
}

export type { IconData, IconProps, IconSize }
export { Icon }

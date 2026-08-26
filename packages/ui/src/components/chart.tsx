import { Icon, type IconData } from '@guideshot/ui/components/icon'
import { cn } from '@guideshot/ui/lib/utils'
import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

const chartThemes = { light: '', dark: '.dark' } as const

type ChartConfig = Record<
  string,
  {
    icon?: IconData
    label?: React.ReactNode
  } & (
    | { color?: string; theme?: never }
    | {
        color?: never
        theme: Record<keyof typeof chartThemes, string>
      }
  )
>

type ChartContextValue = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a ChartContainer')
  }

  return context
}

type ChartContainerProps = React.ComponentProps<'div'> & {
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
  config: ChartConfig
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  function ChartContainer({ children, className, config, id, ...props }, ref) {
    const uniqueId = React.useId()
    const resolvedId = (id || uniqueId).replace(/[^a-zA-Z0-9_-]/g, '')
    const chartId = `chart-${resolvedId}`

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-slot="chart"
          data-chart={chartId}
          className={cn(
            "flex aspect-video min-h-48 w-full justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  }
)

type ChartStyleProps = {
  config: ChartConfig
  id: string
}

function ChartStyle({ config, id }: ChartStyleProps) {
  const colorConfig = Object.entries(config).filter(
    ([key, item]) => /^[a-zA-Z0-9_-]+$/.test(key) && (item.theme || item.color)
  )

  if (colorConfig.length === 0) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(chartThemes)
          .map(
            ([theme, prefix]) => `${prefix} [data-chart="${id}"] {
${colorConfig
  .map(([key, item]) => {
    const color = item.theme?.[theme as keyof typeof item.theme] || item.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join('\n')}
}`
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<
  typeof RechartsPrimitive.Tooltip
> &
  React.ComponentProps<'div'> & {
    hideIndicator?: boolean
    hideLabel?: boolean
    indicator?: 'dot' | 'line' | 'dashed'
    labelKey?: string
    nameKey?: string
  }

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(function ChartTooltipContent(
  {
    active,
    className,
    color,
    formatter,
    hideIndicator = false,
    hideLabel = false,
    indicator = 'dot',
    label,
    labelClassName,
    labelFormatter,
    labelKey,
    nameKey,
    payload,
  },
  ref
) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item.dataKey || item.name || 'value'}`
    const itemConfig = getPayloadConfig(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    return value ? (
      <div className={cn('font-medium', labelClassName)}>{value}</div>
    ) : null
  }, [
    config,
    hideLabel,
    label,
    labelClassName,
    labelFormatter,
    labelKey,
    payload,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      ref={ref}
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-xl border border-border bg-popover px-2.5 py-1.5 text-caption text-popover-foreground shadow-floating',
        className
      )}
    >
      {nestLabel ? null : tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`
          const itemConfig = getPayloadConfig(config, item, key)
          const indicatorColor = color || item.payload.fill || item.color

          return (
            <div
              key={`${item.dataKey || item.name || index}`}
              className={cn(
                'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground',
                indicator === 'dot' && 'items-center'
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <Icon icon={itemConfig.icon} size={12} />
                  ) : hideIndicator ? null : (
                    <div
                      className={cn(
                        'shrink-0 rounded-[2px] border-[var(--color-border)] bg-[var(--color-bg)]',
                        indicator === 'dot' && 'size-2.5',
                        indicator === 'line' && 'w-1',
                        indicator === 'dashed' &&
                          'w-0 border-[1.5px] border-dashed bg-transparent',
                        nestLabel && indicator === 'dashed' && 'my-0.5'
                      )}
                      style={
                        {
                          '--color-bg': indicatorColor,
                          '--color-border': indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between gap-2 leading-none',
                      nestLabel ? 'items-end' : 'items-center'
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value !== undefined && item.value !== null ? (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {formatChartValue(item.value)}
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

const ChartLegend = RechartsPrimitive.Legend

type ChartLegendContentProps = Pick<React.ComponentProps<'div'>, 'className'> &
  Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
    hideIcon?: boolean
    nameKey?: string
  }

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(function ChartLegendContent(
  { className, hideIcon = false, nameKey, payload, verticalAlign = 'bottom' },
  ref
) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className
      )}
    >
      {payload.map(item => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfig(config, item, key)

        return (
          <div
            key={`${item.value}-${key}`}
            className="flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground"
          >
            {itemConfig?.icon && !hideIcon ? (
              <Icon icon={itemConfig.icon} size={12} />
            ) : (
              <div
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})

function formatChartValue(value: unknown) {
  const values = Array.isArray(value) ? value : [value]
  return Array.from(
    new Set(
      values.map(item =>
        typeof item === 'number' || typeof item === 'string'
          ? item.toLocaleString()
          : String(item)
      )
    )
  ).join(' - ')
}

function getPayloadConfig(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const nestedPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configKey = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configKey = payload[key as keyof typeof payload] as string
  } else if (
    nestedPayload &&
    key in nestedPayload &&
    typeof nestedPayload[key as keyof typeof nestedPayload] === 'string'
  ) {
    configKey = nestedPayload[key as keyof typeof nestedPayload] as string
  }

  return config[configKey] || config[key]
}

export type {
  ChartConfig,
  ChartContainerProps,
  ChartLegendContentProps,
  ChartStyleProps,
  ChartTooltipContentProps,
}
export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
}

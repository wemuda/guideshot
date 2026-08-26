const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
  'var(--chart-9)',
  'var(--chart-10)',
  'var(--chart-11)',
  'var(--chart-12)',
  'var(--chart-13)',
  'var(--chart-14)',
] as const

type ChartColor = (typeof chartColors)[number]

function getChartColor(index: number): ChartColor {
  const normalizedIndex =
    ((index % chartColors.length) + chartColors.length) % chartColors.length

  return chartColors[normalizedIndex]
}

export type { ChartColor }
export { chartColors, getChartColor }

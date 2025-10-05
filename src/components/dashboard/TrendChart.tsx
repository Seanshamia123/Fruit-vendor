import { useMemo } from 'react'
import styles from './TrendChart.module.css'

type ChartSeriesVariant = 'gold' | 'blue' | 'green' | 'slate'

const COLOR_MAP: Record<ChartSeriesVariant, string> = {
  gold: '#fbbf24',
  blue: '#60a5fa',
  green: '#34d399',
  slate: '#94a3b8',
}

const DOT_CLASS_MAP: Record<ChartSeriesVariant, string> = {
  gold: styles.legendDotGold,
  blue: styles.legendDotBlue,
  green: styles.legendDotGreen,
  slate: styles.legendDotSlate,
}

export type ChartSeries = {
  name: string
  values: number[]
  variant?: ChartSeriesVariant
}

export type TrendChartProps = {
  title: string
  subtitle?: string
  series: ChartSeries[]
  labels: string[]
  width?: number
  height?: number
  padding?: number
  className?: string
  yAxisLabel?: string
  xAxisLabel?: string
}

const joinClassNames = (...input: (string | undefined)[]) => input.filter(Boolean).join(' ')

const niceNumber = (value: number) => {
  if (value === 0) return 0
  const exponent = Math.floor(Math.log10(value))
  const fraction = value / 10 ** exponent

  if (fraction <= 1) return 1 * 10 ** exponent
  if (fraction <= 2) return 2 * 10 ** exponent
  if (fraction <= 5) return 5 * 10 ** exponent
  return 10 * 10 ** exponent
}

const formatValue = (value: number) => {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`
  }

  return `${value}`
}

const TrendChart = ({
  title,
  subtitle,
  series,
  labels,
  width = 360,
  height = 210,
  padding = 24,
  className,
  yAxisLabel,
  xAxisLabel,
}: TrendChartProps) => {
  const rawValues = useMemo(() => series.flatMap((item) => item.values), [series])
  const rawMaxValue = useMemo(() => (rawValues.length ? Math.max(...rawValues) : 0), [rawValues])

  const horizontalLines = 4
  const { niceMaxValue, niceStep } = useMemo(() => {
    if (rawMaxValue <= 0) {
      return { niceMaxValue: 0, niceStep: 0 }
    }

    const targetStep = rawMaxValue / horizontalLines
    const step = niceNumber(targetStep)
    return { niceMaxValue: step * horizontalLines, niceStep: step }
  }, [rawMaxValue])

  const maxValue = niceMaxValue || rawMaxValue
  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2
  const categoryWidth = labels.length > 0 ? usableWidth / labels.length : 0
  const barGroupWidth = categoryWidth * 0.6
  const groupOffset = (categoryWidth - barGroupWidth) / 2
  const barWidth = series.length > 0 ? barGroupWidth / series.length : 0

  const barRadius = Math.min(6, barWidth / 2)
  const yTickStep = niceStep || (rawMaxValue / horizontalLines) || 0
  const yTickMax = yTickStep * horizontalLines

  return (
    <section className={joinClassNames(styles.card, className)}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>{title}</h2>
          {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
        </div>
        <div className={styles.legend}>
          {series.map((item) => {
            const variant = item.variant ?? 'gold'
            return (
              <span key={item.name} className={styles.legendItem}>
                <span className={joinClassNames(styles.legendDot, DOT_CLASS_MAP[variant])} aria-hidden />
                {item.name}
              </span>
            )
          })}
        </div>
      </div>

      <div className={styles.chartArea}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={title}
          className={styles.chartSvg}
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {Array.from({ length: horizontalLines + 1 }).map((_, index) => {
            if (index === horizontalLines) {
              return null
            }
            const y = padding + ((height - padding * 2) / horizontalLines) * (index + 1)
            return (
              <line
                
                key={`h-${index}`}
                x1={padding}
                y1={y}
                x2={width - padding / 2}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )
          })}

          <line x1={padding} y1={padding / 2} x2={padding} y2={height - padding} stroke="#cbd5f5" strokeWidth={1.2} />
          <line x1={padding} y1={height - padding} x2={width - padding / 4} y2={height - padding} stroke="#cbd5f5" strokeWidth={1.2} />

          {labels.map((label, labelIndex) => {
            const categoryBase = padding + labelIndex * categoryWidth + groupOffset
            return series.map((item, seriesIndex) => {
              const value = item.values[labelIndex] ?? 0
              const heightRatio = maxValue > 0 ? value / maxValue : 0
              const barHeight = heightRatio * usableHeight
              const x = categoryBase + seriesIndex * barWidth
              const y = height - padding - barHeight
              const variant = item.variant ?? 'gold'

              return (
                <rect
                  key={`${item.name}-${label}-${seriesIndex}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={barRadius}
                  ry={barRadius}
                  fill={COLOR_MAP[variant]}
                />
              )
            })
          })}

          {labels.map((label, index) => {
            const x = padding + index * categoryWidth + categoryWidth / 2
            const y = height - padding + 18
            return (
              <text key={label} x={x} y={y} textAnchor="middle" fill="#94a3b8" fontSize="10">
                {label}
              </text>
            )
          })}

          {Array.from({ length: horizontalLines + 1 }).map((_, index) => {
            const value = yTickMax - yTickStep * index
            const y = padding + (usableHeight / horizontalLines) * index
            return (
              <text
                
                key={`y-label-${index}`}
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
              >
                {formatValue(value)}
              </text>
            )
          })}

          {yAxisLabel ? (
            <text x={padding - 26} y={padding / 2 + 4} textAnchor="middle" fill="#94a3b8" fontSize="10">
              {yAxisLabel}
            </text>
          ) : null}
          {xAxisLabel ? (
            <text x={width - padding / 8} y={height - padding + 20} textAnchor="end" fill="#94a3b8" fontSize="10">
              {xAxisLabel}
            </text>
          ) : null}
        </svg>
      </div>
    </section>
  )
}

export default TrendChart

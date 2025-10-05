import styles from './HourlyPatternCard.module.css'
import type { HourlyPoint } from '../../pages/analytics/data'
import EmptyStateCard from '../emptyState/EmptyStateCard'

type Props = {
  points: HourlyPoint[]
}

const HourlyPatternCard = ({ points }: Props) => {
  const hasData = points.length > 0
  const max = Math.max(...points.map((item) => item.value), 1)
  const width = 320
  const height = 220
  const padding = 28
  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2
  const step = usableWidth / (points.length - 1 || 1)

  const areaPath = points
    .map((point, index) => {
      const x = padding + step * index
      const y = padding + usableHeight - (point.value / max) * usableHeight
      return `${index === 0 ? 'L' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const linePath = points
    .map((point, index) => {
      const x = padding + step * index
      const y = padding + usableHeight - (point.value / max) * usableHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Hourly Sales Pattern</h2>
      {hasData ? (
        <svg viewBox="0 0 320 220" role="img" aria-label="Sales by hour" className={styles.chart}>
        <defs>
          <linearGradient id="hourly-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <rect x="28" y="28" width="264" height="164" rx="18" fill="#f8fafc" />
        <path d={`M ${padding} ${padding + usableHeight} ${areaPath} L ${padding + step * (points.length - 1 || 0)} ${padding + usableHeight} Z`} fill="url(#hourly-area)" />
        <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinejoin="round" />
        {points.map((point, index) => (
          <text
            key={point.label}
            x={padding + step * index}
            y={height - padding + 14}
            textAnchor="middle"
            className={styles.axisLabel}
          >
            {point.label}
          </text>
        ))}
      </svg>
      ) : (
        <EmptyStateCard
          icon="chart"
          title="No hourly trend yet"
          description="Capture sales across the day to see peak hours."
          actionLabel="Record Sale"
        />
      )}
    </section>
  )
}

export default HourlyPatternCard

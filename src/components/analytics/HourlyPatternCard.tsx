import { useMemo, useState } from 'react'
import styles from './HourlyPatternCard.module.css'
import type { HourlyPoint } from '../../pages/analytics/data'
import EmptyStateCard from '../emptyState/EmptyStateCard'

type Props = {
  points: HourlyPoint[]
}

const HourlyPatternCard = ({ points }: Props) => {
  const hasData = points.length > 0
  const max = Math.max(...points.map((item) => item.value), 1)
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!points.length) return 0
    const maxVal = Math.max(...points.map((p) => p.value))
    return points.findIndex((p) => p.value === maxVal)
  })

  const activePoint = points[activeIndex]

  const { peak, quiet } = useMemo(() => {
    if (!points.length) return { peak: null, quiet: null }
    let peak = points[0]
    let quiet = points[0]
    points.forEach((point) => {
      if (point.value > peak.value) peak = point
      if (point.value < quiet.value) quiet = point
    })
    return { peak, quiet }
  }, [points])

  const barColor = (intensity: number) => {
    const hue = 200 - intensity * 90
    const lightness = 60 - intensity * 15
    return `hsl(${hue}, 85%, ${lightness}%)`
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Hourly Sales Pattern</h2>
      {hasData ? (
        <>
          <div className={styles.badgeRow}>
            <span>
              Peak hour <strong>{peak?.label}</strong>
            </span>
            <span>
              Quiet hour <strong>{quiet?.label}</strong>
            </span>
          </div>
          <div className={styles.chartShell}>
            <div className={styles.barGrid} role="list">
              {points.map((point, index) => {
                const ratio = point.value / max
                return (
                  <button
                    key={point.label}
                    type="button"
                    role="listitem"
                    className={`${styles.bar} ${activeIndex === index ? styles.barActive : ''}`}
                    style={{
                      height: `${ratio * 100}%`,
                      background: `linear-gradient(180deg, ${barColor(ratio)} 0%, ${barColor(ratio)}70 65%, rgba(255,255,255,0.1) 100%)`,
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    aria-pressed={activeIndex === index}
                    aria-label={`${point.label} hour recorded ${point.value} orders`}
                  >
                    <span className={styles.barLabel}>{point.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          {activePoint && (
            <div className={styles.activeSummary}>
              <div>
                <span className={styles.summaryLabel}>Selected hour</span>
                <strong>{activePoint.label}</strong>
              </div>
              <div>
                <span className={styles.summaryLabel}>Orders</span>
                <strong>{activePoint.value}</strong>
              </div>
              <div>
                <span className={styles.summaryLabel}>Est. revenue</span>
                <strong>KSh {(activePoint.value * 2_800).toLocaleString('en-KE')}</strong>
              </div>
            </div>
          )}
        </>
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

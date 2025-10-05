import { useMemo, useState } from 'react'
import styles from './SalesPerformanceCard.module.css'
import type { SalesPoint } from '../../pages/analytics/data'
import EmptyStateCard from '../emptyState/EmptyStateCard'

type Props = {
  points: SalesPoint[]
}

const metricLabels = {
  sales: 'Sales Trend',
  velocity: 'Velocity',
  profit: 'Profit',
}

type MetricKey = keyof typeof metricLabels

type ViewMode = 'chart' | 'table'

const formatCurrency = (value: number) => `KSh ${value.toLocaleString('en-KE')}`

const SalesPerformanceCard = ({ points }: Props) => {
  const hasData = points.length > 0
  const [metric, setMetric] = useState<MetricKey>('sales')
  const [view, setView] = useState<ViewMode>('chart')

  const chartPath = useMemo(() => {
    if (!points.length) return ''
    const values = points.map((point) => point[metric])
    const width = 520
    const height = 220
    const paddingX = 28
    const paddingY = 28
    const usableWidth = width - paddingX * 2
    const usableHeight = height - paddingY * 2
    const maxValue = Math.max(...values, 1)
    const step = usableWidth / (values.length - 1 || 1)

    const coordinates = values.map((value, index) => {
      const x = paddingX + step * index
      const y = paddingY + usableHeight - (value / maxValue) * usableHeight
      return { x, y }
    })

    const pathStart = `M ${paddingX} ${paddingY + usableHeight}`
    const lines = coordinates.map(({ x, y }) => `L ${x} ${y}`).join(' ')
    const close = `L ${paddingX + step * (values.length - 1 || 0)} ${paddingY + usableHeight} Z`
    return `${pathStart} ${lines} ${close}`
  }, [points, metric])

  const strokeColor = useMemo(() => {
    if (metric === 'velocity') return '#10b981'
    if (metric === 'profit') return '#f97316'
    return '#2563eb'
  }, [metric])

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Sales Performance</h2>
          <p className={styles.subtitle}>Weekly sales overview</p>
        </div>
        <div className={styles.tabGroup} role="tablist">
          <button
            type="button"
            className={`${styles.tabButton} ${view === 'chart' ? styles.tabActive : ''}`}
            onClick={() => setView('chart')}
            aria-selected={view === 'chart'}
          >
            Chart
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${view === 'table' ? styles.tabActive : ''}`}
            onClick={() => setView('table')}
            aria-selected={view === 'table'}
          >
            Table
          </button>
        </div>
      </header>

      <div className={styles.segmentGroup}>
        {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`${styles.segmentButton} ${metric === key ? styles.segmentActive : ''}`}
            onClick={() => setMetric(key)}
          >
            {metricLabels[key]}
          </button>
        ))}
      </div>

      {view === 'chart' ? (
        hasData ? (
          <div className={styles.chartWrapper}>
            <svg viewBox="0 0 520 240" role="img" aria-label={`${metricLabels[metric]} chart`}>
            <defs>
              <linearGradient id="analytics-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <rect x="28" y="28" width="464" height="184" rx="18" fill="#f8fafc" />
            <path d={chartPath} fill="url(#analytics-area)" stroke={strokeColor} strokeWidth="2.4" strokeLinejoin="round" />
            {points.map((point, index) => (
              <text
                key={point.label}
                x={28 + (464 / (points.length - 1 || 1)) * index}
                y={226}
                textAnchor="middle"
                className={styles.axisLabel}
              >
                {point.label}
              </text>
            ))}
          </svg>
        </div>
        ) : (
          <EmptyStateCard
            icon="chart"
            title="No analytics yet"
            description="Start recording sales to unlock performance charts."
            actionLabel="Record Sale"
          />
        )
      ) : (
        hasData ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Day</th>
                <th className={styles.numeric}>{metricLabels[metric]}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.label}>
                  <td data-label="Day">{point.label}</td>
                  <td className={styles.numeric} data-label={metricLabels[metric]}>
                    {metric === 'sales'
                      ? formatCurrency(point.sales)
                      : metric === 'velocity'
                        ? `${point.velocity.toFixed(1)} items/hr`
                        : formatCurrency(point.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyStateCard
            icon="chart"
            title="No table data"
            description="Once transactions are captured we'll populate this table."
            actionLabel="Record Sale"
          />
        )
      )}
    </section>
  )
}

export default SalesPerformanceCard

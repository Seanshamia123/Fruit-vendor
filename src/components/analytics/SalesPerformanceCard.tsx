import { useEffect, useMemo, useState } from 'react'
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
  const [hoverIndex, setHoverIndex] = useState<number | null>(points.length ? points.length - 1 : null)

  useEffect(() => {
    setHoverIndex(points.length ? points.length - 1 : null)
  }, [points])

  const chartMetrics = useMemo(() => {
    if (!points.length) {
      return {
        coordinates: [] as Array<{ x: number; y: number }>,
        areaPath: '',
        linePath: '',
        width: 560,
        height: 220,
        paddingX: 36,
        paddingTop: 28,
        baseline: 0,
      }
    }

    const width = 560
    const height = 220
    const paddingX = 36
    const paddingTop = 28
    const paddingBottom = 36
    const usableWidth = width - paddingX * 2
    const usableHeight = height - paddingTop - paddingBottom
    const values = points.map((point) => point[metric])
    const maxValue = Math.max(...values, 1)
    const step = values.length > 1 ? usableWidth / (values.length - 1) : 0

    const coordinates = values.map((value, index) => {
      const x = paddingX + step * index
      const y = paddingTop + (1 - value / maxValue) * usableHeight
      return { x, y }
    })

    const linePath = coordinates.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const prev = coordinates[index - 1]
      const cpX = (prev.x + point.x) / 2
      return `${path} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`
    }, '')

    const baseline = paddingTop + usableHeight
    const areaPath = linePath
      ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${baseline} L ${coordinates[0].x} ${baseline} Z`
      : ''

    return {
      coordinates,
      areaPath,
      linePath,
      width,
      height,
      paddingX,
      paddingTop,
      baseline,
    }
  }, [points, metric])

  const strokeColor = useMemo(() => {
    if (metric === 'velocity') return '#10b981'
    if (metric === 'profit') return '#f97316'
    return '#2563eb'
  }, [metric])

  const coordinatePoints = chartMetrics.coordinates
  const selectedPoint =
    hoverIndex !== null && coordinatePoints[hoverIndex] ? points[hoverIndex] : null

  const summary = useMemo(() => {
    if (!points.length) return null
    const values = points.map((point) => point[metric])
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length
    const peakIndex = values.indexOf(Math.max(...values))
    const peak = points[peakIndex]
    const last = values[values.length - 1]
    const prev = values[values.length - 2] ?? last
    const change = prev === 0 ? 0 : ((last - prev) / prev) * 100
    return { avg, peak, change }
  }, [points, metric])

  const formatMetricValue = (value: number) => {
    if (metric === 'velocity') return `${value.toFixed(1)} items/hr`
    return formatCurrency(value)
  }

  const formatDelta = (current: number, previous: number | null) => {
    if (previous === null || previous === 0) return 'New trend'
    const delta = ((current - previous) / previous) * 100
    const sign = delta >= 0 ? '+' : ''
    return `${sign}${delta.toFixed(1)}% vs prev`
  }

  const handlePointerMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!coordinatePoints.length) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    let closestIndex = 0
    let minDistance = Infinity
    coordinatePoints.forEach((coord, index) => {
      const distance = Math.abs(coord.x - x)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })
    setHoverIndex(closestIndex)
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Sales Performance</h2>
          <p className={styles.subtitle}>Weekly revenue, profit & throughput</p>
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
          <>
            <div className={styles.chartWrapper}>
              <svg
                viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`}
                role="img"
                aria-label={`${metricLabels[metric]} chart`}
                onMouseMove={handlePointerMove}
                onMouseLeave={() => setHoverIndex(points.length ? points.length - 1 : null)}
              >
                <defs>
                  <linearGradient id="analytics-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.20" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
                  </linearGradient>
                  <filter id="chart-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.15" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect
                  x={chartMetrics.paddingX}
                  y={chartMetrics.paddingTop}
                  width={chartMetrics.width - chartMetrics.paddingX * 2}
                  height={chartMetrics.baseline - chartMetrics.paddingTop}
                  rx="16"
                  fill="#f8fafc"
                />
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1={chartMetrics.paddingX}
                    y1={chartMetrics.paddingTop + ((chartMetrics.baseline - chartMetrics.paddingTop) / 3) * i}
                    x2={chartMetrics.width - chartMetrics.paddingX}
                    y2={chartMetrics.paddingTop + ((chartMetrics.baseline - chartMetrics.paddingTop) / 3) * i}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.45"
                  />
                ))}

                {hoverIndex !== null && coordinatePoints[hoverIndex] && (
                  <line
                    x1={coordinatePoints[hoverIndex].x}
                    x2={coordinatePoints[hoverIndex].x}
                    y1={chartMetrics.paddingTop - 8}
                    y2={chartMetrics.baseline}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    opacity="0.35"
                  />
                )}

                <path d={chartMetrics.areaPath} fill="url(#analytics-area)" />

                <path
                  d={chartMetrics.linePath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  filter="url(#chart-shadow)"
                />

                {coordinatePoints.map((coord, index) => (
                  <g key={index}>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={hoverIndex === index ? 6 : 5}
                      fill="#ffffff"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={hoverIndex === index ? 3 : 2}
                      fill={strokeColor}
                    />
                  </g>
                ))}

                {points.map((point, index) => (
                  <text
                    key={point.label}
                    x={
                      chartMetrics.paddingX +
                      ((chartMetrics.width - chartMetrics.paddingX * 2) / (points.length - 1 || 1)) * index
                    }
                    y={chartMetrics.baseline + 22}
                    textAnchor="middle"
                    className={styles.axisLabel}
                  >
                    {point.label}
                  </text>
                ))}
              </svg>
              {selectedPoint && hoverIndex !== null && coordinatePoints[hoverIndex] && (
                <div
                  className={styles.tooltip}
                  style={{
                    left: `${coordinatePoints[hoverIndex].x - 55}px`,
                    top: `${coordinatePoints[hoverIndex].y - 60}px`,
                  }}
                >
                  <span className={styles.tooltipLabel}>{selectedPoint.label}</span>
                  <strong className={styles.tooltipValue}>{formatMetricValue(selectedPoint[metric])}</strong>
                  <span className={styles.tooltipDelta}>
                    {hoverIndex > 0
                      ? formatDelta(selectedPoint[metric], points[hoverIndex - 1][metric])
                      : 'Starting point'}
                  </span>
                </div>
              )}
            </div>
            {summary && (
              <div className={styles.summaryRow}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Peak day</span>
                  <strong>{summary.peak.label}</strong>
                  <span>{formatMetricValue(summary.peak[metric])}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Average</span>
                  <strong>{formatMetricValue(summary.avg)}</strong>
                  <span>Past 7 days</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Last day shift</span>
                  <strong className={summary.change >= 0 ? styles.positive : styles.negative}>
                    {summary.change >= 0 ? '+' : ''}
                    {summary.change.toFixed(1)}%
                  </strong>
                  <span>vs previous day</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyStateCard
            icon="chart"
            title="No analytics yet"
            description="Start recording sales to unlock performance charts."
            actionLabel="Record Sale"
          />
        )
      ) : hasData ? (
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
      )}
    </section>
  )
}

export default SalesPerformanceCard

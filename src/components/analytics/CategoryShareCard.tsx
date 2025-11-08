import styles from './CategoryShareCard.module.css'
import type { CategorySlice } from '../../pages/analytics/data'
import EmptyStateCard from '../emptyState/EmptyStateCard'

type Props = {
  slices: CategorySlice[]
}

const CategoryShareCard = ({ slices }: Props) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  let cumulative = 0
  const hasData = slices.length > 0

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Sales by Category</h2>
      {hasData ? (
        <div className={styles.content}>
        <div className={styles.chartContainer}>
          <svg viewBox="0 0 36 36" className={styles.chart} role="img" aria-label="Sales breakdown">
            <defs>
              <filter id="donut-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
                <feOffset dx="0" dy="1" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.1"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
            {slices.map((slice) => {
              const fraction = total ? slice.value / total : 0
              const dash = `${fraction * 100} ${100 - fraction * 100}`
              const rotate = cumulative * 360 - 90
              cumulative += fraction
              return (
                <circle
                  key={slice.id}
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="4.5"
                  strokeDasharray={dash}
                  strokeLinecap="round"
                  transform={`rotate(${rotate} 18 18)`}
                  filter="url(#donut-shadow)"
                />
              )
            })}
            <text x="18" y="16" textAnchor="middle" className={styles.centerValue}>
              {total.toFixed(0)}%
            </text>
            <text x="18" y="20.5" textAnchor="middle" className={styles.centerLabel}>
              Total
            </text>
          </svg>
        </div>
        <ul className={styles.legend}>
          {slices.map((slice) => (
            <li key={slice.id} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: slice.color }} />
              <span className={styles.legendLabel}>{slice.label}</span>
              <span className={styles.legendValue}>{slice.value}%</span>
            </li>
          ))}
        </ul>
        </div>
      ) : (
        <EmptyStateCard
          icon="chart"
          title="No category data"
          description="Add products and start selling to see category performance."
          actionLabel="Add Product"
        />
      )}
    </section>
  )
}

export default CategoryShareCard

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
        <svg viewBox="0 0 36 36" className={styles.chart} role="img" aria-label="Sales breakdown">
          <circle cx="18" cy="18" r="16" fill="#f8fafc" />
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
                r="16"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="4"
                strokeDasharray={dash}
                transform={`rotate(${rotate} 18 18)`}
              />
            )
          })}
        </svg>
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

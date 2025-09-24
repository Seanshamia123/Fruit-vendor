import MetricCard, { type MetricCardProps } from './MetricCard'
import styles from './MetricsGrid.module.css'

export type MetricsGridProps = {
  metrics: MetricCardProps[]
}

const MetricsGrid = ({ metrics }: MetricsGridProps) => (
  <section className={styles.grid}>
    {metrics.map((metric) => (
      <MetricCard key={metric.label} {...metric} />
    ))}
  </section>
)

export default MetricsGrid

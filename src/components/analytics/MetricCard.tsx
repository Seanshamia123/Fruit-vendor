import styles from './MetricCard.module.css'
import type { MetricCard as MetricCardType } from '../../hooks/useAnalytics'

type Props = {
  metric: MetricCardType
}

const toneClass: Record<MetricCardType['tone'], string> = {
  green: styles.valueGreen,
  blue: styles.valueBlue,
  orange: styles.valueOrange,
  red: styles.valueRed,
}

const MetricCard = ({ metric }: Props) => (
  <article className={styles.card}>
    <div className={styles.header}>
      <p className={styles.label}>{metric.label}</p>
      {metric.trend && (
        <span className={`${styles.trend} ${metric.trend.startsWith('+') ? styles.trendUp : styles.trendDown}`}>
          {metric.trend}
        </span>
      )}
    </div>
    <p className={`${styles.value} ${toneClass[metric.tone]}`}>{metric.value}</p>
    <p className={styles.helper}>{metric.helper}</p>
  </article>
)

export default MetricCard

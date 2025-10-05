import styles from './MetricCard.module.css'
import type { MetricCard as MetricCardType } from '../../pages/analytics/data'

type Props = {
  metric: MetricCardType
}

const toneClass: Record<MetricCardType['tone'], string> = {
  green: styles.valueGreen,
  blue: styles.valueBlue,
}

const MetricCard = ({ metric }: Props) => (
  <article className={styles.card}>
    <p className={styles.label}>{metric.label}</p>
    <p className={`${styles.value} ${toneClass[metric.tone]}`}>{metric.value}</p>
    <p className={styles.helper}>{metric.helper}</p>
  </article>
)

export default MetricCard

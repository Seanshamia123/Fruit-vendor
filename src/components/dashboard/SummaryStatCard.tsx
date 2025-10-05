import styles from './SummaryStatCard.module.css'
import type { DashboardMetric } from '../../pages/dashboard/data'

const toneClass: Record<DashboardMetric['tone'], string> = {
  green: styles.metricGreen,
  blue: styles.metricBlue,
  purple: styles.metricPurple,
}

type Props = {
  metric: DashboardMetric
}

const SummaryStatCard = ({ metric }: Props) => {
  return (
    <article className={`${styles.card} ${toneClass[metric.tone]}`}>
      <header className={styles.header}>
        <p className={styles.label}>{metric.label}</p>
      </header>
      <p className={styles.value}>{metric.value}</p>
      {metric.helper && <p className={styles.helper}>{metric.helper}</p>}
    </article>
  )
}

export default SummaryStatCard

import styles from './MetricCard.module.css'

export type MetricTone = 'default' | 'positive' | 'alert'

export type MetricCardProps = {
  label: string
  value: string
  badge?: string
  tone?: MetricTone
}

const toneClass: Record<MetricTone, string> = {
  default: styles.valueDefault,
  positive: styles.valuePositive,
  alert: styles.valueAlert,
}

const MetricCard = ({ label, value, badge, tone = 'default' }: MetricCardProps) => (
  <article className={styles.card}>
    <header className={styles.header}>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={`${styles.value} ${toneClass[tone]}`}>{value}</p>
      </div>
      {badge && <span className={styles.badge}>{badge}</span>}
    </header>
  </article>
)

export default MetricCard

import styles from './InsightsCard.module.css'
import type { Insight } from '../../pages/analytics/data'
import EmptyStateCard from '../emptyState/EmptyStateCard'

type Props = {
  items: Insight[]
}

const dotClass: Record<Insight['tone'], string> = {
  info: styles.dotInfo,
  success: styles.dotSuccess,
  alert: styles.dotAlert,
}

const InsightsCard = ({ items }: Props) => (
  <section className={styles.card}>
    <h2 className={styles.title}>Key Insights</h2>
    {items.length ? (
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <span className={`${styles.dot} ${dotClass[item.tone]}`} aria-hidden />
            <div>
              <p className={styles.insightTitle}>{item.title}</p>
              <p className={styles.insightDetail}>{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <EmptyStateCard
        icon="search"
        title="No insights yet"
        description="Once analytics are generated we'll highlight important patterns here."
        actionLabel="Record Sale"
      />
    )}
  </section>
)

export default InsightsCard

import styles from './ActivityFeed.module.css'
import type { ActivityItem } from '../../pages/dashboard/data'

const toneClass: Record<ActivityItem['tone'], string> = {
  success: styles.dotSuccess,
  info: styles.dotInfo,
  alert: styles.dotAlert,
}

type Props = {
  items: ActivityItem[]
}

const ActivityFeed = ({ items }: Props) => (
  <section className={styles.card}>
    <h2 className={styles.title}>Recent Activity</h2>
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <span className={`${styles.dot} ${toneClass[item.tone]}`} aria-hidden />
          <div>
            <p className={styles.description}>{item.description}</p>
            <p className={styles.time}>{item.timeAgo}</p>
          </div>
        </li>
      ))}
    </ul>
  </section>
)

export default ActivityFeed

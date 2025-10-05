import { Link } from 'react-router-dom'
import styles from './SpoilageAlertCard.module.css'
import type { SpoilageSummary } from '../../pages/dashboard/data'

const toneClass = {
  warning: styles.pillWarning,
  critical: styles.pillCritical,
}

type Props = {
  summary: SpoilageSummary
}

const SpoilageAlertCard = ({ summary }: Props) => {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.title}>Spoilage Alert</p>
          <p className={styles.subtitle}>Last check: {summary.lastCheck}</p>
        </div>
        <span className={styles.icon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 2.5 19a1 1 0 0 0 .87 1.5h17.26a1 1 0 0 0 .87-1.5L12 2z" />
            <path d="M12 8v5" />
            <circle cx="12" cy="16.5" r="1" />
          </svg>
        </span>
      </header>

      <div className={styles.list}>
        {summary.items.map((item) => (
          <article key={item.id} className={styles.item}>
            <div>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemMeta}>{item.quantity}</p>
            </div>
            <span className={`${styles.itemPill} ${toneClass[item.tone]}`}>{item.timeLeft}</span>
          </article>
        ))}
      </div>

      <Link to="/spoilage-check" className={styles.cta}>
        View All Alerts
      </Link>
    </section>
  )
}

export default SpoilageAlertCard

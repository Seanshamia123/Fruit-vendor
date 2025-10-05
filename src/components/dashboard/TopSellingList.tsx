import styles from './TopSellingList.module.css'
import type { TopSellingItem } from '../../pages/dashboard/data'

type Props = {
  items: TopSellingItem[]
}

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.trendSvg} aria-hidden>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M15 7h7v7" />
  </svg>
)

const TopSellingList = ({ items }: Props) => {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <TrendIcon />
          <h2 className={styles.title}>Top Selling Items</h2>
        </div>
        <span className={styles.link} aria-hidden>
          Overview
        </span>
      </header>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <div>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemMeta}>{item.unitsSold} units sold</p>
            </div>
            <div className={styles.itemMetrics}>
              <span className={styles.revenue}>{item.revenue}</span>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${Math.round(item.progress * 100)}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TopSellingList

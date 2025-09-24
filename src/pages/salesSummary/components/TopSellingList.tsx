import styles from '../SalesSummary.module.css'

type TopSellingListProps = {
  title: string
  linkLabel: string
  linkHref: string
  items: Array<{ id: string; name: string; rankLabel: string }>
}

const TopSellingList = ({ title, linkLabel, linkHref, items }: TopSellingListProps) => (
  <section className={styles.listCard}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <a href={linkHref} className={styles.sectionLink}>
        {linkLabel}
      </a>
    </div>
    <div className={styles.topItems}>
      {items.map((item) => (
        <article key={item.id} className={styles.topItemCard}>
          <div className={styles.topItemInfo}>
            <div className={styles.productPreview}>L</div>
            <span>{item.name}</span>
          </div>
          <a href="/sales-summary" className={styles.rankLink}>
            {item.rankLabel}
          </a>
        </article>
      ))}
    </div>
  </section>
)

export default TopSellingList


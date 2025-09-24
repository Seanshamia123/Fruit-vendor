import styles from '../DailySales.module.css'

type PaymentBreakdownListProps = {
  title: string
  linkLabel: string
  linkHref: string
  items: Array<{ id: string; label: string; amount: string }>
}

const PaymentBreakdownList = ({ title, linkLabel, linkHref, items }: PaymentBreakdownListProps) => (
  <div className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <a href={linkHref} className={styles.sectionLink}>
        {linkLabel}
      </a>
    </div>
    <div className={styles.breakdownList}>
      {items.map((item) => (
        <div key={item.id} className={styles.breakdownItem}>
          <span>{item.label}</span>
          <span className={styles.breakdownAmount}>{item.amount}</span>
        </div>
      ))}
    </div>
  </div>
)

export default PaymentBreakdownList


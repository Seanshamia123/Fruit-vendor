import styles from '../InventoryAlert.module.css'
import type { InventoryAlertItem, InventoryAlertStatus } from '../data'

const statusPillClass: Record<InventoryAlertStatus, string> = {
  lowStock: styles.statusPill,
  expired: `${styles.statusPill} ${styles.statusPillDanger}`,
  spoilageRisk: styles.statusPill,
}

const InventoryAlertList = ({ items }: { items: InventoryAlertItem[] }) => (
  <div className={styles.alertList}>
    {items.map((item) => (
      <article key={item.id} className={styles.alertCard}>
        <div className={styles.alertInfo}>
          <div className={styles.productPreview}>L</div>
          <div>
            <div>{item.name}</div>
            <div className={styles.alertMeta}>
              <span className={statusPillClass[item.status]}>
                {item.status === 'lowStock' && 'Low stock'}
                {item.status === 'expired' && 'Expired'}
                {item.status === 'spoilageRisk' && 'Spoilage risk'}
              </span>
              {item.secondary && <span className={styles.secondaryInfo}>{item.secondary}</span>}
            </div>
          </div>
        </div>
        {item.actionLabel ? (
          <a href="/inventory" className={styles.actionButton}>
            {item.actionLabel}
          </a>
        ) : null}
      </article>
    ))}
  </div>
)

export default InventoryAlertList

import styles from '../InventoryAlert.module.css'
import { legendItems, type InventoryAlertStatus } from '../data'

const statusClass: Record<InventoryAlertStatus, string> = {
  lowStock: styles.dotLowStock,
  expired: styles.dotExpired,
  spoilageRisk: styles.dotSpoilage,
}

const InventoryLegend = () => (
  <div className={styles.legendCard}>
    {legendItems.map((item) => (
      <div key={item.id} className={styles.legendItem}>
        <span className={`${styles.legendDot} ${statusClass[item.id]}`} />
        <span>{item.label}</span>
      </div>
    ))}
  </div>
)

export default InventoryLegend


import MainLayout from '../../layouts/MainLayout'
import styles from './InventoryAlert.module.css'
import InventoryLegend from './components/InventoryLegend'
import InventoryAlertList from './components/InventoryAlertList'
import { inventoryAlerts } from './data'

const InventoryAlert = () => (
  <MainLayout title="Inventory Alert" subtitle="Act on items before they impact sales">
    <div className={styles.pageStack}>
      <InventoryLegend />
      <InventoryAlertList items={inventoryAlerts} />
      <a href="/inventory" className={styles.footerAction}>
        Go to inventory
      </a>
    </div>
  </MainLayout>
)

export default InventoryAlert


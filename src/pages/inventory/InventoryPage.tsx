import { useMemo, useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import styles from './Inventory.module.css'
import NewPurchase from './components/NewPurchase'
import ProductManagement from './components/ProductManagement'
import InventoryOverview from './components/InventoryOverview'
import InventoryAlerts from './components/InventoryAlerts'
import PurchaseRecords from './components/PurchaseRecords'
import { useInventoryData } from '../../hooks/useInventoryData'
import type { PurchaseLine } from './types'

type InventoryView = 'new_purchase' | 'product_management' | 'overview' | 'alerts' | 'records'

const viewLabels: Record<InventoryView, string> = {
  new_purchase: 'New Purchase',
  product_management: 'Product Management',
  overview: 'Inventory Snapshot',
  alerts: 'Stock Alerts',
  records: 'Purchase Records',
}

const InventoryPage = () => {
  const [activeView, setActiveView] = useState<InventoryView>('new_purchase')
  const {
    isLoading,
    error,
    inventoryItems: inventoryList,
    purchaseRecords: purchaseRecordsList,
    handleSavePurchase: savePurchaseToApi,
  } = useInventoryData()

  const handleSavePurchase = async (lines: PurchaseLine[]): Promise<boolean> => {
    const success = await savePurchaseToApi(lines)
    if (success) {
      setActiveView('records')
    }
    return success
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'new_purchase':
        return <NewPurchase onSave={handleSavePurchase} />
      case 'product_management':
        return <ProductManagement items={inventoryList} />
      case 'overview':
        return <InventoryOverview items={inventoryList} />
      case 'alerts':
        return <InventoryAlerts />
      case 'records':
        return <PurchaseRecords records={purchaseRecordsList} />
      default:
        return null
    }
  }

  const activeViewLabel = useMemo(() => viewLabels[activeView], [activeView])

  if (error) {
    return (
      <MainLayout title="Inventory" subtitle="Manage stock, purchases, and product alerts">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Error loading inventory</h2>
          <p>{error}</p>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout title="Inventory" subtitle="Manage stock, purchases, and product alerts">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading inventory data...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Inventory" subtitle="Manage stock, purchases, and product alerts">
      <div className={styles.inventoryPage}>
        <div className={styles.viewSwitcher}>
          <div className={styles.viewSwitcherText}>
            <span className={styles.viewSwitcherLabel}>View mode</span>
            <span className={styles.viewSwitcherTitle}>{activeViewLabel}</span>
          </div>
          <div className={styles.tabStrip}>
            {(Object.keys(viewLabels) as InventoryView[]).map((view) => (
              <button
                key={view}
                type="button"
                className={`${styles.tabButton} ${activeView === view ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveView(view)}
              >
                {viewLabels[view]}
              </button>
            ))}
          </div>
        </div>

        {renderActiveView()}
      </div>
    </MainLayout>
  )
}

export default InventoryPage

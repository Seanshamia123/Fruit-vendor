import { useMemo, useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import styles from './Inventory.module.css'
import NewPurchase from './components/NewPurchase'
import ProductManagement from './components/ProductManagement'
import InventoryOverview from './components/InventoryOverview'
import InventoryAlerts from './components/InventoryAlerts'
import PurchaseRecords from './components/PurchaseRecords'
import { inventoryItems, purchaseHistory } from './data'
import type { InventoryItem, PurchaseHistory, PurchaseLine } from './types'

type InventoryView = 'new_purchase' | 'product_management' | 'overview' | 'alerts' | 'records'

const viewLabels: Record<InventoryView, string> = {
  new_purchase: 'New Purchase',
  product_management: 'Product Management',
  overview: 'Inventory Snapshot',
  alerts: 'Stock Alerts',
  records: 'Purchase Records',
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })

const formatQuantity = (value: number, unit: string) => {
  if (Number.isNaN(value)) return `0 ${unit}`
  if (unit === 'pieces' || unit === 'units') {
    return `${Math.round(value)} ${unit}`
  }
  const formatted = Number(value.toFixed(1))
  return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)} ${unit}`
}

const normaliseUnit = (unit: string) => unit.trim().toLowerCase()

const parseQuantity = (input: string) => {
  const parts = input.split(' ')
  const value = Number(parts[0])
  const unit = parts.slice(1).join(' ').trim()
  return { value: Number.isNaN(value) ? 0 : value, unit }
}

const InventoryPage = () => {
  const [activeView, setActiveView] = useState<InventoryView>('new_purchase')
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(inventoryItems)
  const [purchaseRecordsList, setPurchaseRecordsList] = useState<PurchaseHistory[]>(purchaseHistory)

  const handleSavePurchase = (lines: PurchaseLine[]): boolean => {
    if (!lines.length) return false

    const purchaseDate = new Date()
    const totalAmount = lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitCost || 0), 0)

    setInventoryList((prev) => {
      const next = [...prev]

      const ensureUniqueId = (base: string) => {
        let slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`
        let counter = 1
        while (next.some((item) => item.id === slug)) {
          slug = `${slug}-${counter}`
          counter += 1
        }
        return slug
      }

      lines.forEach((line) => {
        const quantityValue = Number(line.quantity)
        const unitCostValue = Number(line.unitCost)
        if (!quantityValue || !unitCostValue) return

        if (line.id) {
          const index = next.findIndex((item) => item.id === line.id)
          if (index !== -1) {
            const existing = next[index]
            const { value: currentValue, unit: currentUnit } = parseQuantity(existing.quantity)
            if (currentUnit && normaliseUnit(currentUnit) === normaliseUnit(line.unit)) {
              const updatedQuantity = formatQuantity(currentValue + quantityValue, currentUnit)
              next[index] = {
                ...existing,
                quantity: updatedQuantity,
                unitPrice: `KSh ${unitCostValue.toLocaleString('en-KE')}/${line.unit}`,
              }
            } else {
              next[index] = {
                ...existing,
                quantity: `${existing.quantity} (+${line.quantity} ${line.unit})`,
                unitPrice: `KSh ${unitCostValue.toLocaleString('en-KE')}/${line.unit}`,
                notes: `Mixed unit purchase recorded on ${formatDate(purchaseDate)}`,
              }
            }
            return
          }
        }

        const newId = ensureUniqueId(line.name)
        next.push({
          id: newId,
          name: line.name,
          quantity: formatQuantity(quantityValue, line.unit),
          unitPrice: `KSh ${unitCostValue.toLocaleString('en-KE')}/${line.unit}`,
          category: line.category ?? 'Other',
          status: 'Good',
          addedOn: formatDate(purchaseDate),
          expiresOn: 'Not set',
        })
      })

      return next
    })

    setPurchaseRecordsList((prev) => {
      const recordNumber = prev.length + 1
      const newRecord: PurchaseHistory = {
        id: `PUR-${String(recordNumber).padStart(3, '0')}`,
        supplier: 'Local Supplier',
        date: formatDate(purchaseDate),
        status: 'Complete',
        total: `KSh ${totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`,
        items: lines.map((line) => `${line.name} (${line.quantity} ${line.unit})`),
      }

      return [newRecord, ...prev]
    })

    setActiveView('records')
    return true
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

export type InventoryAlertStatus = 'lowStock' | 'expired' | 'spoilageRisk'

export const legendItems: Array<{ id: InventoryAlertStatus; label: string }> = [
  { id: 'lowStock', label: 'Low stock' },
  { id: 'expired', label: 'Expired' },
  { id: 'spoilageRisk', label: 'Spoilage risk' },
]

export type InventoryAlertItem = {
  id: string
  name: string
  status: InventoryAlertStatus
  secondary?: string
  actionLabel?: string
  secondaryLink?: string
}

export const inventoryAlerts: InventoryAlertItem[] = [
  { id: '1', name: 'Lettuce', status: 'lowStock', actionLabel: 'Stock turnover' },
  { id: '2', name: 'Lettuce', status: 'expired', actionLabel: 'Spoilage check' },
  { id: '3', name: 'Lettuce', status: 'lowStock', actionLabel: 'Remove from stock' },
  { id: '4', name: 'Lettuce', status: 'spoilageRisk', secondary: '5 left' },
  { id: '5', name: 'Lettuce', status: 'spoilageRisk', secondary: '2 days left' },
  { id: '6', name: 'Lettuce', status: 'lowStock', actionLabel: 'Remove from stock' },
]


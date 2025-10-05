export type InventoryCategory = 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Other'

export type InventoryStatus = 'Good' | 'Low' | 'Out' | 'Spoiled'

export type InventoryItem = {
  id: string
  name: string
  variety?: string
  quantity: string
  unitPrice: string
  category: InventoryCategory
  status: InventoryStatus
  addedOn: string
  expiresOn: string
  notes?: string
}

export type PurchaseHistory = {
  id: string
  supplier: string
  date: string
  status: 'Complete' | 'Pending'
  total: string
  items: string[]
}

export type PurchaseUnit = 'kg' | 'pieces' | 'litres' | 'units'

export type AlertPlan = {
  id: string
  name: string
  category: InventoryCategory
  status: InventoryStatus
  enabled: boolean
  reorderThreshold: number
  criticalThreshold: number
  expiryWarningDays: number
}

export type PurchaseCandidate = {
  id: string
  name: string
  variety?: string
  category: InventoryCategory
  lastPrice: string
  availableQuantity: string
}

export type PurchaseDraft = {
  itemId: string
  quantity: string
  unit: PurchaseUnit
  unitCost: string
}

export type PurchaseLine = {
  id?: string
  name: string
  category?: InventoryCategory
  quantity: string
  unit: PurchaseUnit
  unitCost: string
}

export type PurchaseTab = 'existing' | 'new'

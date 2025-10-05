export type UnitType = 'kg' | 'pieces'

export type InventoryItem = {
  id: string
  name: string
  unit: UnitType
  pricePerUnit: number
  stock: number
  status?: 'available' | 'out-of-stock'
}

export type CartLine = {
  itemId: string
  quantity: number
  unitPrice: number
}

export type CartRecord = Record<string, CartLine>

export type CustomerSessionStatus = 'in-progress' | 'paid'

export type CustomerSession = {
  id: string
  label: string
  createdAt: number
  items: CartRecord
  status: CustomerSessionStatus
}

export type PaymentMethod = 'cash' | 'mpesa' | 'card'

export type PaymentStage = 'method' | 'processing' | 'success' | 'saleComplete' | 'failure'

export type PaymentSource = 'quick' | 'manual' | 'session'

export type PaymentFlow = {
  source: PaymentSource
  sessionId: string
  referenceId: string
  stage: PaymentStage
  method?: PaymentMethod
  phoneNumber?: string
  attempt: number
  errorCode?: string
}

import type { CustomerSession, InventoryItem } from './types'

export const initialInventory: InventoryItem[] = [
  { id: 'tomatoes', name: 'Tomatoes', unit: 'kg', pricePerUnit: 150, stock: 25 },
  { id: 'onions', name: 'Onions', unit: 'kg', pricePerUnit: 120, stock: 30 },
  { id: 'carrots', name: 'Carrots', unit: 'kg', pricePerUnit: 100, stock: 20 },
  { id: 'bananas', name: 'Bananas', unit: 'kg', pricePerUnit: 80, stock: 15 },
  { id: 'lettuce', name: 'Lettuce', unit: 'pieces', pricePerUnit: 50, stock: 40 },
  { id: 'spinach', name: 'Spinach', unit: 'pieces', pricePerUnit: 60, stock: 35 },
  { id: 'potatoes', name: 'Potatoes', unit: 'kg', pricePerUnit: 90, stock: 0, status: 'out-of-stock' },
  { id: 'apples', name: 'Apples', unit: 'kg', pricePerUnit: 200, stock: 18 },
]

const now = Date.now()

export const initialSessions: CustomerSession[] = [
  {
    id: 'customer-1',
    label: 'Customer 1',
    createdAt: now - 5 * 60 * 1000,
    status: 'in-progress',
    items: {
      tomatoes: { itemId: 'tomatoes', quantity: 2, unitPrice: 150 },
      onions: { itemId: 'onions', quantity: 1, unitPrice: 120 },
    },
  },
  {
    id: 'customer-2',
    label: 'Customer 2',
    createdAt: now - 2 * 60 * 1000,
    status: 'in-progress',
    items: {
      bananas: { itemId: 'bananas', quantity: 3, unitPrice: 80 },
    },
  },
]

// TypeScript types matching backend schemas

// Auth & Vendor Types
export type VendorOut = {
  id: number
  name: string
  email: string
  contact: string
  location?: string | null
  created_at: string
}

export type VendorCreate = {
  name: string
  email: string
  contact: string
  location?: string
  password: string
}

export type LoginCredentials = {
  username: string  // email
  password: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
}

// Product Types
export type Product = {
  id: number
  name: string
  unit: string
  variation?: string | null
  sale_type: string
  is_active: boolean
}

export type ProductCreate = {
  name: string
  unit: string
  variation?: string
  sale_type: string
}

// Sale Types
export type Sale = {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  reference_no?: string | null
  payment_type: string
  cart_id?: number | null
  timestamp: string
}

export type SaleCreate = {
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  reference_no?: string
  payment_type?: string
  cart_id?: number
}

export type SaleUpdate = {
  quantity?: number
  unit_price?: number
  total_price?: number
  reference_no?: string
  payment_type?: string
  cart_id?: number
}

// Inventory Types
export type Inventory = {
  id: number
  product_id: number
  quantity: number
}

export type InventoryCreate = {
  product_id: number
  quantity: number
}

// Purchase Types
export type Purchase = {
  id: number
  product_id: number
  quantity: number
  unit_cost: number
  total_cost: number
  source?: string | null
  timestamp: string
}

export type PurchaseCreate = {
  product_id: number
  quantity: number
  unit_cost: number
  total_cost: number
  source?: string
}

// Product Pricing Types
export type ProductPricing = {
  id: number
  product_id: number
  price_type: string
  price: number
  effective_from?: string | null
  effective_to?: string | null
}

export type ProductPricingCreate = {
  product_id: number
  price_type: string
  price: number
  effective_from?: string
  effective_to?: string
}

// Spoilage Entry Types
export type SpoilageEntry = {
  id: number
  product_id: number
  quantity: number
  reason?: string | null
  timestamp: string
}

export type SpoilageEntryCreate = {
  product_id: number
  quantity: number
  reason?: string
}

// Vendor Preference Types
export type VendorPreference = {
  id: number
  vendor_id: number
  // Display preferences
  dashboard_metrics?: Record<string, any>
  color_theme?: string
  display_mode?: string
  display_options?: Record<string, any>
  language?: string
  // Alert settings
  alert_low_stock?: boolean
  alert_daily_summary?: boolean
  alert_rewards?: boolean
  alert_spoilage?: boolean
  // Pricing settings
  pricing_margin?: number
  pricing_quick_pricing?: boolean
  pricing_auto_suggest?: boolean
  // Quick sale products
  quick_sale_products?: string[]
  // Loyalty/rewards
  loyalty_enabled?: boolean
}

export type VendorPreferenceUpdate = Partial<Omit<VendorPreference, 'id' | 'vendor_id'>>

// Cart Types
export type Cart = {
  id: number
  vendor_id: number
  status: string
  created_at: string
}

export type CartItem = {
  id: number
  cart_id: number
  product_id: number
  quantity: number
  unit_price: number
}

export type CartItemCreate = {
  cart_id: number
  product_id: number
  quantity: number
  unit_price: number
}

// Bonus Rule Types
export type BonusRule = {
  id: number
  vendor_id: number
  rule_name: string
  condition_type: string
  condition_value: number
  bonus_type: string
  bonus_value: number
  is_active: boolean
  created_at: string
}

export type BonusRuleCreate = {
  rule_name: string
  condition_type: string
  condition_value: number
  bonus_type: string
  bonus_value: number
  is_active?: boolean
}

// Payment Types
export type Payment = {
  id: number
  sale_id: number
  amount: number
  payment_method: string
  timestamp: string
}

export type PaymentCreate = {
  sale_id: number
  amount: number
  payment_method: string
}

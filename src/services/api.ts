import { apiFetch } from '../utils/api'
import type {
  AuthResponse,
  LoginCredentials,
  VendorCreate,
  VendorOut,
  Product,
  ProductCreate,
  Sale,
  SaleCreate,
  SaleUpdate,
  Inventory,
  InventoryCreate,
  Purchase,
  PurchaseCreate,
  ProductPricing,
  ProductPricingCreate,
  SpoilageEntry,
  SpoilageEntryCreate,
  VendorPreference,
  VendorPreferenceCreate,
  Cart,
  CartItem,
  CartItemCreate,
  BonusRule,
  BonusRuleCreate,
  Payment,
  PaymentCreate,
} from './types'

// ==================== AUTH API ====================
export const authApi = {
  register: (data: VendorCreate) =>
    apiFetch<VendorOut>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  login: (credentials: LoginCredentials) => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: formData,
      auth: false,
    })
  },
}

// ==================== PRODUCT API ====================
export const productApi = {
  list: () => apiFetch<Product[]>('/products'),

  get: (id: number) => apiFetch<Product>(`/products/${id}`),

  create: (data: ProductCreate) =>
    apiFetch<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProductCreate) =>
    apiFetch<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleStatus: (id: number, active: boolean) =>
    apiFetch<Product>(`/products/${id}/status?active=${active}`, {
      method: 'PATCH',
    }),

  delete: (id: number) =>
    apiFetch<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== SALE API ====================
export const saleApi = {
  list: () => apiFetch<Sale[]>('/sales/'),

  get: (id: number) => apiFetch<Sale>(`/sales/${id}`),

  create: (data: SaleCreate) =>
    apiFetch<Sale>('/sales/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: SaleUpdate) =>
    apiFetch<Sale>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<{ ok: boolean }>(`/sales/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== INVENTORY API ====================
export const inventoryApi = {
  list: () => apiFetch<Inventory[]>('/inventory/'),

  add: (data: InventoryCreate) =>
    apiFetch<Inventory>('/inventory/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== PURCHASE API ====================
export const purchaseApi = {
  list: () => apiFetch<Purchase[]>('/purchases/'),

  get: (id: number) => apiFetch<Purchase>(`/purchases/${id}`),

  create: (data: PurchaseCreate) =>
    apiFetch<Purchase>('/purchases/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== PRODUCT PRICING API ====================
export const pricingApi = {
  list: (productId: number) => apiFetch<ProductPricing[]>(`/product-pricings/${productId}`),

  create: (data: ProductPricingCreate) =>
    apiFetch<ProductPricing>('/product-pricings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProductPricingCreate) =>
    apiFetch<ProductPricing>(`/product-pricings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/product-pricings/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== SPOILAGE API ====================
export const spoilageApi = {
  list: () => apiFetch<SpoilageEntry[]>('/spoilage-entries/'),

  get: (id: number) => apiFetch<SpoilageEntry>(`/spoilage-entries/${id}`),

  create: (data: SpoilageEntryCreate) =>
    apiFetch<SpoilageEntry>('/spoilage-entries/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: SpoilageEntryCreate) =>
    apiFetch<SpoilageEntry>(`/spoilage-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/spoilage-entries/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== VENDOR PREFERENCE API ====================
export const vendorPreferenceApi = {
  list: () => apiFetch<VendorPreference[]>('/vendor-preferences/'),

  get: (key: string) => apiFetch<VendorPreference>(`/vendor-preferences/${key}`),

  create: (data: VendorPreferenceCreate) =>
    apiFetch<VendorPreference>('/vendor-preferences/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (key: string, value: string) =>
    apiFetch<VendorPreference>(`/vendor-preferences/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ preference_value: value }),
    }),

  delete: (key: string) =>
    apiFetch<void>(`/vendor-preferences/${key}`, {
      method: 'DELETE',
    }),
}

// ==================== CART API ====================
export const cartApi = {
  list: () => apiFetch<Cart[]>('/carts/'),

  get: (id: number) => apiFetch<Cart>(`/carts/${id}`),

  create: () =>
    apiFetch<Cart>('/carts/', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  updateStatus: (id: number, status: string) =>
    apiFetch<Cart>(`/carts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// ==================== CART ITEM API ====================
export const cartItemApi = {
  list: (cartId: number) => apiFetch<CartItem[]>(`/cart-items/?cart_id=${cartId}`),

  add: (data: CartItemCreate) =>
    apiFetch<CartItem>('/cart-items/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CartItemCreate>) =>
    apiFetch<CartItem>(`/cart-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/cart-items/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== BONUS RULE API ====================
export const bonusRuleApi = {
  list: () => apiFetch<BonusRule[]>('/bonus-rules/'),

  get: (id: number) => apiFetch<BonusRule>(`/bonus-rules/${id}`),

  create: (data: BonusRuleCreate) =>
    apiFetch<BonusRule>('/bonus-rules/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<BonusRuleCreate>) =>
    apiFetch<BonusRule>(`/bonus-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleActive: (id: number, isActive: boolean) =>
    apiFetch<BonusRule>(`/bonus-rules/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/bonus-rules/${id}`, {
      method: 'DELETE',
    }),
}

// ==================== PAYMENT API ====================
export const paymentApi = {
  list: () => apiFetch<Payment[]>('/payments/'),

  get: (id: number) => apiFetch<Payment>(`/payments/${id}`),

  create: (data: PaymentCreate) =>
    apiFetch<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ==================== VENDOR API ====================
export const vendorApi = {
  getCurrent: () => apiFetch<VendorOut>('/auth/me'),

  update: (id: number, data: Partial<VendorCreate>) =>
    apiFetch<VendorOut>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// ==================== VENDOR PREFERENCES API ====================
export const preferenceApi = {
  get: () => apiFetch<VendorPreference>('/vendor-preferences'),

  update: (data: VendorPreferenceUpdate) =>
    apiFetch<VendorPreference>('/vendor-preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

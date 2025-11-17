export type ApiRequestInit = RequestInit & { auth?: boolean }

const DEFAULT_BASE_URL = 'http://localhost:8000'

const getBaseUrl = () => {
  if (typeof window === 'undefined') return DEFAULT_BASE_URL
  return window.__FRUIT_VENDOR_API__?.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL
}

type TokenCarrier = { token?: string }

const readAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  const fromGlobal = window.__FRUIT_VENDOR_API__?.token
  if (fromGlobal) return fromGlobal
  try {
    const storageRaw = window.localStorage.getItem('fruitVendor:auth-token')
    if (!storageRaw) return null
    const parsed = JSON.parse(storageRaw) as TokenCarrier
    return parsed.token ?? null
  } catch (err) {
    console.warn('Failed to read auth token', err)
    return null
  }
}

export const apiFetch = async <T>(path: string, init: ApiRequestInit = {}): Promise<T> => {
  const baseUrl = getBaseUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  const headers = new Headers(init.headers ?? {})

  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (init.auth ?? true) {
    const token = readAuthToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(url, { ...init, headers, credentials: 'include' })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data = await response.json()
      // Handle FastAPI validation errors (array format)
      if (Array.isArray(data.detail)) {
        message = data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
      } else if (typeof data.detail === 'string') {
        message = data.detail
      } else if (typeof data.detail === 'object') {
        message = JSON.stringify(data.detail)
      } else {
        message = data.message ?? message
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // ignore JSON parsing errors
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return undefined as T
}

export type ProductRecord = {
  id: number
  name: string
  unit: string
  variation?: string | null
  sale_type: string
  is_active: boolean
}

export type PricingPayload = {
  product_id: number
  price_type: string
  price: number
  effective_from?: string
  effective_to?: string
}

export type ProductPricingRecord = PricingPayload & { id: number }

export const listProducts = () => apiFetch<ProductRecord[]>('/products')

export const createProductPricing = (payload: PricingPayload) =>
  apiFetch<ProductPricingRecord>('/product-pricings/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const fetchProductPricings = (productId: number) =>
  apiFetch<ProductPricingRecord[]>(`/product-pricings/${productId}`)

declare global {
  interface Window {
    __FRUIT_VENDOR_API__?: {
      baseUrl?: string
      token?: string
    }
  }
}

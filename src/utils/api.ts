export type ApiRequestInit = RequestInit & { auth?: boolean }

const DEFAULT_BASE_URL = 'https://fruit-vendor.onrender.com'

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

  // Set Content-Type for JSON bodies
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Add authorization token if needed
  if (init.auth ?? true) {
    const token = readAuthToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  let response: Response
  try {
    response = await fetch(url, { ...init, headers, credentials: 'include' })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Network request failed'
    console.error('Fetch error:', errorMsg)
    throw new Error(`Network error: ${errorMsg}`)
  }

  // Handle non-2xx responses
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const contentType = response.headers.get('Content-Type') ?? ''
      
      if (contentType.includes('application/json')) {
        const data = await response.json()
        
        // Handle FastAPI validation errors (array format)
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (typeof data.detail === 'object') {
          errorMessage = JSON.stringify(data.detail)
        } else if (data.message) {
          errorMessage = data.message
        }
      } else {
        const text = await response.text()
        if (text) errorMessage = text
      }
    } catch (parseErr) {
      console.warn('Could not parse error response:', parseErr)
    }
    
    throw new Error(errorMessage)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  // Parse response body
  try {
    const contentType = response.headers.get('Content-Type') ?? ''
    
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return data as T
    }
    
    // Return empty object for non-JSON responses
    return {} as T
  } catch (parseErr) {
    console.error('Failed to parse response:', parseErr)
    throw new Error(`Failed to parse response: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`)
  }
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
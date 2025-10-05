import { useCallback, useEffect, useState } from 'react'
import { listProducts, type ProductRecord } from '../utils/api'

type CatalogueState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  products: ProductRecord[]
}

const initialState: CatalogueState = {
  status: 'idle',
  error: null,
  products: [],
}

export const useProductCatalogue = () => {
  const [state, setState] = useState<CatalogueState>(initialState)

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    try {
      const results = await listProducts()
      setState({ status: 'ready', error: null, products: results })
    } catch (error) {
      if (error instanceof Error) {
        setState({ status: 'error', error: error.message, products: [] })
      } else {
        setState({ status: 'error', error: 'Failed to load products', products: [] })
      }
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    products: state.products,
    loading: state.status === 'loading' || state.status === 'idle',
    error: state.error,
    status: state.status,
    refresh: load,
  }
}

export default useProductCatalogue

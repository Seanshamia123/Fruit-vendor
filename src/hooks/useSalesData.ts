import { useState, useEffect, useCallback } from 'react'
import { productApi, saleApi, inventoryApi } from '../services/api'
import type { Product, Sale, Inventory } from '../services/types'

type InventoryItem = {
  id: string
  name: string
  unit: 'kg' | 'pieces'
  pricePerUnit: number
  stock: number
  status: 'available' | 'out-of-stock'
}

type CartLine = {
  itemId: string
  quantity: number
  unitPrice: number
}

type CartRecord = Record<string, CartLine>

type SaleRecord = Sale & {
  productName: string
  productUnit: string
}

export const useSalesData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [productsData, inventoryData, salesData] = await Promise.all([
        productApi.list(),
        inventoryApi.list(),
        saleApi.list(),
      ])

      setProducts(productsData)
      setInventory(inventoryData)

      // Transform to inventory items for sales UI
      const items: InventoryItem[] = inventoryData
        .map((inv) => {
          const product = productsData.find((p) => p.id === inv.product_id)
          if (!product) return null

          // Get latest sale for pricing
          const productSales = salesData.filter((s) => s.product_id === product.id)
          const latestSale = productSales.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]

          return {
            id: product.id.toString(),
            name: product.name,
            unit: (product.unit === 'kg' ? 'kg' : 'pieces') as 'kg' | 'pieces',
            pricePerUnit: latestSale?.unit_price ?? 100,
            stock: inv.quantity,
            status: (inv.quantity > 0 ? 'available' : 'out-of-stock') as 'available' | 'out-of-stock',
          }
        })
        .filter((item): item is InventoryItem => item !== null)

      setInventoryItems(items)

      // Transform sales with product info
      const records: SaleRecord[] = salesData.map((sale) => {
        const product = productsData.find((p) => p.id === sale.product_id)
        return {
          ...sale,
          productName: product?.name ?? 'Unknown',
          productUnit: product?.unit ?? 'units',
        }
      })

      setSalesRecords(records)
    } catch (err) {
      console.error('Failed to fetch sales data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sales data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCompleteSale = useCallback(
    async (cart: CartRecord, paymentMethod: string): Promise<boolean> => {
      try {
        setError(null)

        // Process each cart line as a sale
        for (const [itemId, line] of Object.entries(cart)) {
          const productId = parseInt(itemId)
          const product = products.find((p) => p.id === productId)
          if (!product) continue

          const totalPrice = line.quantity * line.unitPrice

          // Create sale
          await saleApi.create({
            product_id: productId,
            quantity: line.quantity,
            unit_price: line.unitPrice,
            total_price: totalPrice,
            payment_type: paymentMethod,
          })

          // Update inventory (decrease stock)
          const currentInv = inventory.find((inv) => inv.product_id === productId)
          if (currentInv) {
            // inventoryApi.add increments stock, so send a negative delta to deduct sales
            const deduction = Math.min(currentInv.quantity, line.quantity)
            if (deduction > 0) {
              await inventoryApi.add({
                product_id: productId,
                quantity: -deduction,
              })
            }
          }
        }

        // Refresh data
        await fetchData()
        return true
      } catch (err) {
        console.error('Failed to complete sale:', err)
        setError(err instanceof Error ? err.message : 'Failed to complete sale')
        return false
      }
    },
    [products, inventory, fetchData]
  )

  const handleCreateQuickSale = useCallback(
    async (
      productId: number,
      quantity: number,
      unitPrice: number,
      paymentMethod: string
    ): Promise<boolean> => {
      try {
        setError(null)

        const totalPrice = quantity * unitPrice

        await saleApi.create({
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          payment_type: paymentMethod,
        })

        // Update inventory
        const currentInv = inventory.find((inv) => inv.product_id === productId)
        if (currentInv) {
          const deduction = Math.min(currentInv.quantity, quantity)
          if (deduction > 0) {
            await inventoryApi.add({
              product_id: productId,
              quantity: -deduction,
            })
          }
        }

        await fetchData()
        return true
      } catch (err) {
        console.error('Failed to create quick sale:', err)
        setError(err instanceof Error ? err.message : 'Failed to create quick sale')
        return false
      }
    },
    [inventory, fetchData]
  )

  return {
    isLoading,
    error,
    inventoryItems,
    salesRecords,
    handleCompleteSale,
    handleCreateQuickSale,
    refetch: fetchData,
  }
}

import { useState, useEffect, useCallback } from 'react'
import { productApi, inventoryApi, purchaseApi } from '../services/api'
import type { Product, Inventory } from '../services/types'
import type { InventoryItem, PurchaseHistory, PurchaseLine, PurchaseCandidate } from '../pages/inventory/types'

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })

const formatQuantity = (value: number, unit: string) => {
  if (Number.isNaN(value)) return `0 ${unit}`
  if (unit === 'pieces' || unit === 'units') {
    return `${Math.round(value)} ${unit}`
  }
  const formatted = Number(value.toFixed(1))
  return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)} ${unit}`
}

export const useInventoryData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseHistory[]>([])
  const [purchaseCandidates, setPurchaseCandidates] = useState<PurchaseCandidate[]>([])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [productsData, inventoryData, purchasesData] = await Promise.all([
        productApi.list(),
        inventoryApi.list(),
        purchaseApi.list(),
      ])

      setProducts(productsData)
      setInventory(inventoryData)

      // Transform data for inventory items display
      const items: InventoryItem[] = inventoryData.map((inv) => {
        const product = productsData.find((p) => p.id === inv.product_id)
        const productPurchases = purchasesData.filter((p) => p.product_id === inv.product_id)
        const latestPurchase = productPurchases.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]

        let status: 'Good' | 'Low' | 'Out' | 'Spoiled' = 'Good'
        if (inv.quantity === 0) status = 'Out'
        else if (inv.quantity < 10) status = 'Low'

        return {
          id: product?.id.toString() ?? inv.id.toString(),
          name: product?.name ?? 'Unknown Product',
          variety: product?.variation ?? undefined,
          quantity: formatQuantity(inv.quantity, product?.unit ?? 'units'),
          unitPrice: latestPurchase
            ? `KSh ${latestPurchase.unit_cost.toLocaleString('en-KE')}/${product?.unit ?? 'unit'}`
            : 'N/A',
          category: 'Other',
          status,
          addedOn: latestPurchase ? formatDate(new Date(latestPurchase.timestamp)) : 'Unknown',
          expiresOn: 'Not set',
        }
      })

      setInventoryItems(items)

      // Transform purchase history
      const records: PurchaseHistory[] = purchasesData
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((purchase, index) => {
          const product = productsData.find((p) => p.id === purchase.product_id)
          return {
            id: `PUR-${String(purchasesData.length - index).padStart(3, '0')}`,
            supplier: purchase.source ?? 'Local Supplier',
            date: formatDate(new Date(purchase.timestamp)),
            status: 'Complete',
            total: `KSh ${purchase.total_cost.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`,
            items: [
              `${product?.name ?? 'Unknown'} (${purchase.quantity} ${product?.unit ?? 'units'})`,
            ],
          }
        })

      setPurchaseRecords(records)

      // Generate purchase candidates from products
      const candidates: PurchaseCandidate[] = productsData.map((product) => {
        const productInventory = inventoryData.find((inv) => inv.product_id === product.id)
        const productPurchases = purchasesData.filter((p) => p.product_id === product.id)
        const latestPurchase = productPurchases.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]

        const quantity = productInventory?.quantity ?? 0
        const lastPrice = latestPurchase
          ? `KSh ${latestPurchase.unit_cost.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`
          : 'KSh 0'

        return {
          id: product.id.toString(),
          name: product.name,
          variety: product.variation ?? undefined,
          category: 'Other',
          lastPrice,
          availableQuantity: formatQuantity(quantity, product.unit),
        }
      })

      setPurchaseCandidates(candidates)
    } catch (err) {
      console.error('Failed to fetch inventory data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load inventory data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSavePurchase = useCallback(
    async (lines: PurchaseLine[]): Promise<boolean> => {
      if (!lines.length) return false

      try {
        setError(null)

        // Process each purchase line
        for (const line of lines) {
          const quantityValue = Number(line.quantity)
          const unitCostValue = Number(line.unitCost)
          if (!quantityValue || !unitCostValue) continue

          // Find or create product
          let product: Product | undefined
          if (line.id) {
            product = products.find((p) => p.id.toString() === line.id)
          }

          if (!product) {
            // Create new product
            const newProduct = await productApi.create({
              name: line.name,
              unit: line.unit,
              variation: undefined,
              sale_type: 'retail',
            })
            product = newProduct
            setProducts((prev) => [...prev, newProduct])
          }

          // Create purchase record
          await purchaseApi.create({
            product_id: product.id,
            quantity: quantityValue,
            unit_cost: unitCostValue,
            total_cost: quantityValue * unitCostValue,
            source: 'Local Supplier',
          })

          // Update or create inventory
          const existingInventory = inventory.find((inv) => inv.product_id === product!.id)
          if (existingInventory) {
            // inventoryApi.add increments existing stock, so we only send the delta
            await inventoryApi.add({
              product_id: product.id,
              quantity: quantityValue,
            })
          } else {
            await inventoryApi.add({
              product_id: product.id,
              quantity: quantityValue,
            })
          }
        }

        // Refresh data
        await fetchData()
        return true
      } catch (err) {
        console.error('Failed to save purchase:', err)
        setError(err instanceof Error ? err.message : 'Failed to save purchase')
        return false
      }
    },
    [products, inventory, fetchData]
  )

  const handleCreateProduct = useCallback(
    async (name: string, unit: string, variation?: string) => {
      try {
        setError(null)
        const newProduct = await productApi.create({
          name,
          unit,
          variation,
          sale_type: 'retail',
        })
        setProducts((prev) => [...prev, newProduct])
        return newProduct
      } catch (err) {
        console.error('Failed to create product:', err)
        setError(err instanceof Error ? err.message : 'Failed to create product')
        throw err
      }
    },
    []
  )

  const handleToggleProductStatus = useCallback(
    async (productId: number, active: boolean) => {
      try {
        setError(null)
        await productApi.toggleStatus(productId, active)
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_active: active } : p))
        )
      } catch (err) {
        console.error('Failed to toggle product status:', err)
        setError(err instanceof Error ? err.message : 'Failed to toggle product status')
        throw err
      }
    },
    []
  )

  return {
    isLoading,
    error,
    products,
    inventoryItems,
    purchaseRecords,
    purchaseCandidates,
    handleSavePurchase,
    handleCreateProduct,
    handleToggleProductStatus,
    refetch: fetchData,
  }
}

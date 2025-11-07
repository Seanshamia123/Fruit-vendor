import { useState, useEffect, useCallback } from 'react'
import { productApi, spoilageApi, inventoryApi } from '../services/api'
import type { Product, Inventory } from '../services/types'

type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

type SpoilageItem = {
  id: string
  name: string
  category: string
  quantity: string
  risk: RiskLevel
  reason: string
  timestamp: string
  daysAgo: number
  timeLeft: string
  addedOn: string
}

type RiskSummary = {
  level: RiskLevel | 'all'
  count: number
}

export const useSpoilageData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])

  const [attentionItems, setAttentionItems] = useState<SpoilageItem[]>([])
  const [riskSummaries, setRiskSummaries] = useState<RiskSummary[]>([])
  const [lastCheck, setLastCheck] = useState<string>('Never')

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [productsData, spoilageData, inventoryData] = await Promise.all([
        productApi.list(),
        spoilageApi.list(),
        inventoryApi.list(),
      ])

      setProducts(productsData)
      setInventory(inventoryData)

      // Find last check timestamp
      if (spoilageData.length > 0) {
        const latestEntry = spoilageData.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]
        setLastCheck(new Date(latestEntry.timestamp).toLocaleDateString())
      }

      // Transform spoilage entries
      const items: SpoilageItem[] = spoilageData.map((entry) => {
        const product = productsData.find((p) => p.id === entry.product_id)
        const daysAgo = Math.floor(
          (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        )

        let risk: RiskLevel = 'low'
        if (entry.quantity > 20) risk = 'critical'
        else if (entry.quantity > 10) risk = 'high'
        else if (entry.quantity > 5) risk = 'medium'

        const timeLeft = daysAgo <= 1 ? 'Today' : daysAgo <= 2 ? '1 day' : `${daysAgo} days ago`
        const addedOn = new Date(entry.timestamp).toLocaleDateString()

        return {
          id: entry.id.toString(),
          name: product?.name ?? 'Unknown Product',
          category: product?.sale_type ?? 'Other',
          quantity: `${entry.quantity} ${product?.unit ?? 'units'}`,
          risk,
          reason: entry.reason ?? 'Quality check',
          timestamp: addedOn,
          daysAgo,
          timeLeft,
          addedOn,
        }
      })

      setAttentionItems(items)

      // Calculate risk summaries
      const summaries: RiskSummary[] = [
        { level: 'all', count: items.length },
        { level: 'critical', count: items.filter((i) => i.risk === 'critical').length },
        { level: 'high', count: items.filter((i) => i.risk === 'high').length },
        { level: 'medium', count: items.filter((i) => i.risk === 'medium').length },
        { level: 'low', count: items.filter((i) => i.risk === 'low').length },
      ]

      setRiskSummaries(summaries)
    } catch (err) {
      console.error('Failed to fetch spoilage data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load spoilage data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateSpoilageEntry = useCallback(
    async (productId: number, quantity: number, reason?: string): Promise<boolean> => {
      try {
        setError(null)
        await spoilageApi.create({
          product_id: productId,
          quantity,
          reason,
        })

        // Update inventory to reduce stock
        const currentInv = inventory.find((inv) => inv.product_id === productId)
        if (currentInv) {
          // Reduce inventory by sending a negative delta equal to the spoilage quantity
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
        console.error('Failed to create spoilage entry:', err)
        setError(err instanceof Error ? err.message : 'Failed to create spoilage entry')
        return false
      }
    },
    [inventory, fetchData]
  )

  return {
    isLoading,
    error,
    attentionItems,
    riskSummaries,
    lastCheck,
    products,
    handleCreateSpoilageEntry,
    refetch: fetchData,
  }
}

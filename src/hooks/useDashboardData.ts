import { useState, useEffect } from 'react'
import { productApi, saleApi, spoilageApi, inventoryApi } from '../services/api'

type DashboardMetric = {
  id: string
  label: string
  value: string
  helper?: string
  tone: 'green' | 'blue' | 'purple'
}

type SpoilageItem = {
  id: string
  name: string
  quantity: string
  timeLeft: string
  tone: 'critical' | 'warning'
}

type TopSellingItem = {
  id: string
  name: string
  unitsSold: number
  revenue: string
  progress: number
}

type ActivityItem = {
  id: string
  description: string
  timeAgo: string
  tone: 'success' | 'info' | 'alert'
}

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [spoilageSummary, setSpoilageSummary] = useState<{ lastCheck: string; items: SpoilageItem[] }>({
    lastCheck: 'Never',
    items: [],
  })
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [productsData, salesData, spoilageData, inventoryData] = await Promise.all([
          productApi.list(),
          saleApi.list(),
          spoilageApi.list(),
          inventoryApi.list(),
        ])

        // Compute metrics from sales data
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const todaySales = salesData.filter((sale) => new Date(sale.timestamp) >= todayStart)

        const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_price, 0)
        const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_price, 0)
        const totalSales = salesData.length
        const lowStockCount = inventoryData.filter((inv) => inv.quantity < 10).length

        const computedMetrics: DashboardMetric[] = [
          {
            id: 'revenue',
            label: "Today's Revenue",
            value: `KES ${todayRevenue.toLocaleString()}`,
            helper: `Total: KES ${totalRevenue.toLocaleString()}`,
            tone: 'green',
          },
          {
            id: 'sales',
            label: 'Total Sales',
            value: totalSales.toString(),
            helper: `${todaySales.length} today`,
            tone: 'blue',
          },
          {
            id: 'inventory',
            label: 'Low Stock Items',
            value: lowStockCount.toString(),
            helper: 'Requires attention',
            tone: 'purple',
          },
        ]

        setMetrics(computedMetrics)

        // Compute spoilage summary
        if (spoilageData.length > 0) {
          const latestSpoilage = spoilageData.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]

          const spoilageItems: SpoilageItem[] = spoilageData.slice(0, 5).map((entry) => {
            const product = productsData.find((p) => p.id === entry.product_id)
            return {
              id: entry.id.toString(),
              name: product?.name ?? 'Unknown Product',
              quantity: `${entry.quantity} ${product?.unit ?? 'units'}`,
              timeLeft: new Date(entry.timestamp).toLocaleDateString(),
              tone: entry.quantity > 5 ? 'critical' : 'warning',
            }
          })

          setSpoilageSummary({
            lastCheck: new Date(latestSpoilage.timestamp).toLocaleDateString(),
            items: spoilageItems,
          })
        }

        // Compute top selling items
        const productSales = salesData.reduce(
          (acc, sale) => {
            if (!acc[sale.product_id]) {
              acc[sale.product_id] = { quantity: 0, revenue: 0 }
            }
            acc[sale.product_id].quantity += sale.quantity
            acc[sale.product_id].revenue += sale.total_price
            return acc
          },
          {} as Record<number, { quantity: number; revenue: number }>
        )

        const topItems: TopSellingItem[] = Object.entries(productSales)
          .sort(([, a], [, b]) => b.quantity - a.quantity)
          .slice(0, 5)
          .map(([productId, data]) => {
            const product = productsData.find((p) => p.id === parseInt(productId))
            const maxQuantity = Math.max(...Object.values(productSales).map((s) => s.quantity))
            return {
              id: productId,
              name: product?.name ?? 'Unknown Product',
              unitsSold: Math.round(data.quantity),
              revenue: `KES ${data.revenue.toLocaleString()}`,
              progress: (data.quantity / maxQuantity) * 100,
            }
          })

        setTopSellingItems(topItems)

        // Compute recent activity from sales
        const recentSalesActivity: ActivityItem[] = salesData
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
          .map((sale) => {
            const product = productsData.find((p) => p.id === sale.product_id)
            const timeAgo = getTimeAgo(new Date(sale.timestamp))
            return {
              id: sale.id.toString(),
              description: `Sold ${sale.quantity} ${product?.unit ?? 'units'} of ${product?.name ?? 'Unknown'} - KES ${sale.total_price}`,
              timeAgo,
              tone: 'success' as const,
            }
          })

        setRecentActivity(recentSalesActivity)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    isLoading,
    error,
    metrics,
    spoilageSummary,
    topSellingItems,
    recentActivity,
    refetch: () => {
      setIsLoading(true)
      // Trigger re-fetch by updating a dependency
    },
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

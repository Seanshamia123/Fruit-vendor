import { useState, useEffect, useCallback } from 'react'
import { productApi, saleApi, inventoryApi, spoilageApi, purchaseApi } from '../services/api'

export type MetricCard = {
  id: string
  label: string
  value: string
  helper: string
  trend?: string
  tone: 'green' | 'blue' | 'orange' | 'red'
}

export type SalesPoint = {
  label: string
  sales: number
  velocity: number
  profit: number
}

export type CategorySlice = {
  id: string
  label: string
  value: number
  color: string
}

export type HourlyPoint = {
  label: string
  value: number
}

export type Insight = {
  id: string
  title: string
  detail: string
  tone: 'info' | 'success' | 'alert'
}

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => `KSh ${currencyFormatter.format(value)}`

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [salesPerformance, setSalesPerformance] = useState<SalesPoint[]>([])
  const [categoryShares, setCategoryShares] = useState<CategorySlice[]>([])
  const [hourlyPattern, setHourlyPattern] = useState<HourlyPoint[]>([])
  const [insights, setInsights] = useState<Insight[]>([])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [productsData, salesData, inventoryData, spoilageData, purchasesData] = await Promise.all([
        productApi.list(),
        saleApi.list(),
        inventoryApi.list(),
        spoilageApi.list(),
        purchaseApi.list(),
      ])

      // Calculate metrics
      const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_price, 0)
      const totalItems = salesData.reduce((sum, sale) => sum + sale.quantity, 0)
      const totalCost = purchasesData.reduce((sum, purchase) => sum + purchase.total_cost, 0)
      const totalProfit = totalRevenue - totalCost
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

      // Spoilage metrics
      const totalSpoilage = spoilageData.reduce((sum, entry) => sum + entry.quantity, 0)
      const spoilageRate = totalItems > 0 ? (totalSpoilage / (totalItems + totalSpoilage)) * 100 : 0

      // Inventory value (estimate based on average purchase cost)
      const avgPurchaseCost = purchasesData.length > 0
        ? purchasesData.reduce((sum, p) => sum + (p.total_cost / p.quantity), 0) / purchasesData.length
        : 0
      const totalInventoryQty = inventoryData.reduce((sum, inv) => sum + inv.quantity, 0)
      const inventoryValue = totalInventoryQty * avgPurchaseCost

      // Payment methods breakdown
      const cashSales = salesData.filter(s => s.payment_type === 'Cash').reduce((sum, s) => sum + s.total_price, 0)
      const mpesaSales = salesData.filter(s => s.payment_type === 'Mpesa').reduce((sum, s) => sum + s.total_price, 0)

      const metricsData: MetricCard[] = [
        {
          id: 'total-revenue',
          label: 'Total Revenue',
          value: formatCurrency(totalRevenue),
          helper: `${salesData.length} transactions`,
          tone: 'green',
        },
        {
          id: 'net-profit',
          label: 'Net Profit',
          value: formatCurrency(totalProfit),
          helper: `${profitMargin.toFixed(1)}% margin`,
          tone: totalProfit >= 0 ? 'green' : 'red',
        },
        {
          id: 'inventory-value',
          label: 'Inventory Value',
          value: formatCurrency(inventoryValue),
          helper: `${inventoryData.length} items in stock`,
          tone: 'blue',
        },
        {
          id: 'spoilage-rate',
          label: 'Spoilage Rate',
          value: `${spoilageRate.toFixed(1)}%`,
          helper: `${totalSpoilage.toFixed(1)} kg wasted`,
          tone: spoilageRate > 10 ? 'red' : spoilageRate > 5 ? 'orange' : 'green',
        },
        {
          id: 'cash-sales',
          label: 'Cash Sales',
          value: formatCurrency(cashSales),
          helper: `${((cashSales / totalRevenue) * 100).toFixed(0)}% of revenue`,
          tone: 'blue',
        },
        {
          id: 'mpesa-sales',
          label: 'M-Pesa Sales',
          value: formatCurrency(mpesaSales),
          helper: `${((mpesaSales / totalRevenue) * 100).toFixed(0)}% of revenue`,
          tone: 'green',
        },
      ]
      setMetrics(metricsData)

      // Generate sales performance (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0, 0, 0, 0)
        return date
      })

      const performanceData: SalesPoint[] = last7Days.map((date) => {
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const daySales = salesData.filter((sale) => {
          const saleDate = new Date(sale.timestamp)
          return saleDate >= date && saleDate < nextDay
        })

        const totalSales = daySales.reduce((sum, s) => sum + s.total_price, 0)
        const totalQty = daySales.reduce((sum, s) => sum + s.quantity, 0)

        return {
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: totalSales,
          velocity: totalQty,
          profit: totalSales * 0.25, // Assuming 25% profit margin
        }
      })
      setSalesPerformance(performanceData)

      // Calculate category shares by product
      const productSales = new Map<number, number>()
      salesData.forEach((sale) => {
        const current = productSales.get(sale.product_id) || 0
        productSales.set(sale.product_id, current + sale.total_price)
      })

      const categoryData: CategorySlice[] = Array.from(productSales.entries())
        .map(([productId, revenue], index) => {
          const product = productsData.find((p) => p.id === productId)
          return {
            id: productId.toString(),
            label: product?.name || `Product ${productId}`,
            value: revenue,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          }
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Top 8 products

      setCategoryShares(categoryData)

      // Calculate hourly pattern (24 hours)
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourSales = salesData.filter((sale) => {
          const saleHour = new Date(sale.timestamp).getHours()
          return saleHour === hour
        })

        const totalQty = hourSales.reduce((sum, s) => sum + s.quantity, 0)

        return {
          label: `${hour.toString().padStart(2, '0')}:00`,
          value: totalQty,
        }
      })
      setHourlyPattern(hourlyData)

      // Generate insights
      const insightsData: Insight[] = []

      if (salesData.length === 0) {
        insightsData.push({
          id: 'no-sales',
          title: 'No Sales Yet',
          detail: 'Start recording sales to see insights and analytics.',
          tone: 'info',
        })
      } else {
        // Spoilage warning
        if (spoilageRate > 10) {
          insightsData.push({
            id: 'high-spoilage',
            title: 'High Spoilage Alert',
            detail: `${spoilageRate.toFixed(1)}% spoilage rate detected. Review inventory management and ordering practices.`,
            tone: 'alert',
          })
        } else if (spoilageRate > 5) {
          insightsData.push({
            id: 'moderate-spoilage',
            title: 'Monitor Spoilage',
            detail: `${spoilageRate.toFixed(1)}% spoilage rate. Consider reducing order quantities for slow-moving items.`,
            tone: 'alert',
          })
        }

        // Low stock alert
        const lowStockItems = inventoryData.filter((inv) => inv.quantity < 5)
        if (lowStockItems.length > 0) {
          const productNames = lowStockItems.map((inv) => {
            const product = productsData.find((p) => p.id === inv.product_id)
            return product?.name || `Product ${inv.product_id}`
          }).slice(0, 3).join(', ')
          insightsData.push({
            id: 'low-stock',
            title: 'Low Stock Alert',
            detail: `${lowStockItems.length} item(s) running low: ${productNames}${lowStockItems.length > 3 ? '...' : ''}`,
            tone: 'alert',
          })
        }

        // Best selling product
        if (categoryData.length > 0) {
          insightsData.push({
            id: 'best-seller',
            title: 'Top Performer',
            detail: `${categoryData[0].label} generates ${formatCurrency(categoryData[0].value)} in revenue.`,
            tone: 'success',
          })
        }

        // Profit margin insight
        if (profitMargin < 15) {
          insightsData.push({
            id: 'low-margin',
            title: 'Low Profit Margin',
            detail: `Current margin at ${profitMargin.toFixed(1)}%. Consider adjusting prices or reducing costs.`,
            tone: 'alert',
          })
        } else if (profitMargin > 30) {
          insightsData.push({
            id: 'healthy-margin',
            title: 'Healthy Margins',
            detail: `Excellent ${profitMargin.toFixed(1)}% profit margin maintained.`,
            tone: 'success',
          })
        }

        // Peak hours
        const maxHourlyValue = Math.max(...hourlyData.map((h) => h.value))
        const peakHours = hourlyData.filter((h) => h.value === maxHourlyValue)
        if (peakHours.length > 0 && maxHourlyValue > 0) {
          insightsData.push({
            id: 'peak-hours',
            title: 'Peak Sales Hours',
            detail: `Busiest period around ${peakHours[0].label}. Ensure adequate staffing and stock.`,
            tone: 'info',
          })
        }

        // Payment preference
        if (mpesaSales > cashSales * 1.5) {
          insightsData.push({
            id: 'mpesa-preference',
            title: 'M-Pesa Preference',
            detail: `${((mpesaSales / totalRevenue) * 100).toFixed(0)}% of sales via M-Pesa. Ensure service is always available.`,
            tone: 'info',
          })
        }
      }

      setInsights(insightsData)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    isLoading,
    error,
    metrics,
    salesPerformance,
    categoryShares,
    hourlyPattern,
    insights,
    refetch: fetchData,
  }
}

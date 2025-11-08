import { useState, useEffect, useCallback } from 'react'
import { bonusRuleApi, pricingApi, productApi, purchaseApi } from '../services/api'
import type { BonusRule, ProductPricing } from '../services/types'

export type PriceMetric = {
  id: string
  label: string
  value: string
  description: string
}

export type ProductPrice = {
  id: string
  name: string
  variety?: string
  pricingMode: string
  currentPrice: string
  purchasePrice: string
  marginPercent: string
  lastUpdated: string
  tags?: string[]
}

export type RewardRule = {
  id: string
  name: string
  status: 'active' | 'inactive'
  condition: string
  reward: string
  createdOn: string
  appliedCount: number
  iconLabel: string
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })

const formatCurrency = (value: number) => `KSh ${value.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

export const usePriceManagement = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [bonusRules, setBonusRules] = useState<BonusRule[]>([])
  const [productPricings, setProductPricings] = useState<ProductPricing[]>([])

  const [priceMetrics, setPriceMetrics] = useState<PriceMetric[]>([])
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([])
  const [rewardRules, setRewardRules] = useState<RewardRule[]>([])
  const [rewardSummaryMetrics, setRewardSummaryMetrics] = useState<PriceMetric[]>([])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [productsData, purchasesData, bonusRulesData] = await Promise.all([
        productApi.list(),
        purchaseApi.list(),
        bonusRuleApi.list(),
      ])

      setBonusRules(bonusRulesData)

      // Fetch pricing for all products
      const pricingsPromises = productsData.map((product) =>
        pricingApi.list(product.id).catch(() => [] as ProductPricing[])
      )
      const pricingsArrays = await Promise.all(pricingsPromises)
      const allPricings = pricingsArrays.flat()
      setProductPricings(allPricings)

      // Calculate product prices with margins
      const prices: ProductPrice[] = productsData.map((product) => {
        const productPurchases = purchasesData.filter((p) => p.product_id === product.id)
        const latestPurchase = productPurchases.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]

        const productPricing = allPricings.find((p) => p.product_id === product.id)

        const purchasePrice = latestPurchase?.unit_cost ?? 0
        const sellingPrice = productPricing?.price ?? purchasePrice * 1.3 // default 30% margin
        const margin = purchasePrice > 0 ? ((sellingPrice - purchasePrice) / purchasePrice) * 100 : 0

        return {
          id: product.id.toString(),
          name: product.name,
          variety: product.variation ?? undefined,
          pricingMode: 'Per unit',
          currentPrice: formatCurrency(sellingPrice),
          purchasePrice: formatCurrency(purchasePrice),
          marginPercent: `${margin.toFixed(1)}%`,
          lastUpdated: latestPurchase
            ? formatDate(new Date(latestPurchase.timestamp))
            : 'Never',
          tags: [],
        }
      })

      setProductPrices(prices)

      // Calculate price metrics
      const averagePrice = prices.length > 0
        ? prices.reduce((sum, p) => sum + parseFloat(p.currentPrice.replace(/[^0-9.]/g, '')), 0) / prices.length
        : 0

      const averageMargin = prices.length > 0
        ? prices.reduce((sum, p) => sum + parseFloat(p.marginPercent.replace('%', '')), 0) / prices.length
        : 0

      const priceBelowTarget = prices.filter((p) => parseFloat(p.marginPercent.replace('%', '')) < 20).length

      const metrics: PriceMetric[] = [
        {
          id: 'average-price',
          value: prices.length > 0 ? formatCurrency(averagePrice) : '--',
          label: 'Average Price',
          description: prices.length > 0 ? 'Across all products' : 'No prices recorded yet',
        },
        {
          id: 'average-margin',
          value: prices.length > 0 ? `${averageMargin.toFixed(1)}%` : '--',
          label: 'Average Margin',
          description: prices.length > 0 ? 'Average profit margin' : 'Set a selling price to see margins',
        },
        {
          id: 'price-dips',
          value: priceBelowTarget.toString(),
          label: 'Prices Below Target',
          description: priceBelowTarget > 0 ? 'Products with margin < 20%' : 'You have no price alerts yet',
        },
      ]

      setPriceMetrics(metrics)

      // Transform bonus rules for display
      const rules: RewardRule[] = bonusRulesData.map((rule) => ({
        id: rule.id.toString(),
        name: rule.rule_name,
        status: rule.is_active ? 'active' : 'inactive',
        condition: `Spend ${formatCurrency(rule.condition_value)}`,
        reward: rule.bonus_type === 'percentage'
          ? `${rule.bonus_value}% discount`
          : rule.bonus_type === 'fixed'
          ? `${formatCurrency(rule.bonus_value)} off`
          : `Free item`,
        createdOn: formatDate(new Date(rule.created_at)),
        appliedCount: 0, // Backend doesn't track this yet
        iconLabel: rule.bonus_type === 'percentage' ? 'Percent' : rule.bonus_type === 'fixed' ? 'Fixed' : 'Gift',
      }))

      setRewardRules(rules)

      // Calculate reward summary metrics
      const activeRules = bonusRulesData.filter((r) => r.is_active).length
      const totalRules = bonusRulesData.length

      const rewardMetrics: PriceMetric[] = [
        {
          id: 'active-rules',
          value: activeRules.toString(),
          label: 'Active Rules',
          description: activeRules > 0 ? `${activeRules} reward rules enabled` : 'You have not created any reward rules yet',
        },
        {
          id: 'times-used',
          value: '0', // Backend doesn't track this yet
          label: 'Times Applied',
          description: 'Activity appears after your first reward',
        },
        {
          id: 'total-rules',
          value: totalRules.toString(),
          label: 'Total Rules',
          description: totalRules > 0 ? `${totalRules} total rules created` : 'Build rules to see progress here',
        },
      ]

      setRewardSummaryMetrics(rewardMetrics)
    } catch (err) {
      console.error('Failed to fetch price management data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load price management data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleBonusRule = useCallback(
    async (ruleId: number, isActive: boolean) => {
      try {
        setError(null)
        await bonusRuleApi.toggleActive(ruleId, isActive)
        setBonusRules((prev) =>
          prev.map((rule) => (rule.id === ruleId ? { ...rule, is_active: isActive } : rule))
        )
        await fetchData() // Refresh to update metrics
      } catch (err) {
        console.error('Failed to toggle bonus rule:', err)
        setError(err instanceof Error ? err.message : 'Failed to toggle bonus rule')
        throw err
      }
    },
    [fetchData]
  )

  const handleDeleteBonusRule = useCallback(
    async (ruleId: number) => {
      try {
        setError(null)
        await bonusRuleApi.delete(ruleId)
        await fetchData()
      } catch (err) {
        console.error('Failed to delete bonus rule:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete bonus rule')
        throw err
      }
    },
    [fetchData]
  )

  return {
    isLoading,
    error,
    priceMetrics,
    productPrices,
    rewardRules,
    rewardSummaryMetrics,
    bonusRules,
    productPricings,
    handleToggleBonusRule,
    handleDeleteBonusRule,
    refetch: fetchData,
  }
}

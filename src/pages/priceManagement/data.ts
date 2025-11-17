export type PricingTip = {
  id: string
  title: string
  description: string
}

export type PricingPlan = {
  id: string
  title: string
  description: string
  example: string
  icon: 'unit' | 'bulk' | 'time'
}

export type StrategyMetric = {
  id: string
  label: string
  value: string
  description: string
}

export type ProductStrategy = {
  id: string
  name: string
  activeStrategy: string
  availableStrategies: string[]
  detailLabel: string
  detailValue: string
  highlight?: boolean
  schedule?: { label: string; value: string }[]
}

export const pricingTips: PricingTip[] = [
  {
    id: 'healthy-margin',
    title: 'Protect your margin',
    description: 'Aim for at least a 20-30% margin on daily essentials.',
  },
  {
    id: 'watch-market',
    title: 'Track market shifts',
    description: 'Adjust prices quickly as supply changes in the market.',
  },
  {
    id: 'use-history',
    title: 'Lean on history',
    description: 'Compare today\'s prices with last month to spot trends early.',
  },
]

export const pricingPlans: PricingPlan[] = [
  {
    id: 'unit',
    title: 'Per Item',
    description: 'One flat price per unit (kg, litre, piece). Clear and predictable pricing for shoppers.',
    example: 'Example: KSh 150 per kg',
    icon: 'unit',
  },
  {
    id: 'bulk',
    title: 'By Measure',
    description: 'Tiered pricing that rewards bulk buyers. Great for wholesalers and regular customers.',
    example: 'Example: 5kg = KSh 700, 10kg = KSh 1,300',
    icon: 'bulk',
  },
  {
    id: 'time',
    title: 'Time-Based',
    description: 'Flexible prices that respond to time of day or day of week. Perfect for fast-moving goods.',
    example: 'Example: Morning KSh 65, Evening KSh 70',
    icon: 'time',
  },
]

export const bestPractices: PricingTip[] = [
  {
    id: 'per-item',
    title: 'Per Item',
    description: 'Great for everyday staples where customers expect consistent pricing.',
  },
  {
    id: 'bulk',
    title: 'By Measure',
    description: 'Use when shoppers regularly purchase in bulk. Offer bigger discounts for bigger baskets.',
  },
  {
    id: 'time',
    title: 'Time-Based',
    description: 'Ideal for perishables like milk or bread. Nudge sales during slower hours.',
  },
]

export const strategyMetrics: StrategyMetric[] = [
  {
    id: 'per-piece',
    label: 'Per Item',
    value: '--',
    description: 'No pricing plans created yet',
  },
  {
    id: 'bulk',
    label: 'By Measure',
    value: '--',
    description: 'Create bulk pricing to unlock discounts',
  },
  {
    id: 'time-based',
    label: 'Time-Based',
    value: '--',
    description: 'Schedule a price to see activity here',
  },
]

export const productStrategies: ProductStrategy[] = []

export const rewardTips: PricingTip[] = [
  {
    id: 'keep-simple',
    title: 'Keep it clear',
    description: 'Short rules like "Buy 5, get 1 free" are easy for staff to remember.',
  },
  {
    id: 'monitor-performance',
    title: 'Track performance',
    description: 'Review how often rules trigger and pause the ones that are quiet.',
  },
  {
    id: 'refresh-regularly',
    title: 'Refresh regularly',
    description: 'Toggle off rules that have run their course to keep offers fresh.',
  },
]

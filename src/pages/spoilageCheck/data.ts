export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export type RiskSummary = {
  level: RiskLevel | 'all'
  label: string
  count: number
}

export type AttentionItem = {
  id: string
  name: string
  quantity: string
  category: string
  addedOn: string
  timeLeft: string
  risk: RiskLevel
}

export type RecommendedAction = {
  id: string
  label: string
}

export const recommendedActions: RecommendedAction[] = [
  { id: 'discount-critical', label: 'Apply 30% discount to critical items' },
  { id: 'bundle-high', label: 'Bundle high-risk items with popular products' },
  { id: 'schedule-check', label: 'Schedule next spoilage check for tomorrow' },
]

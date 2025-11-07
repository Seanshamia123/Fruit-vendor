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

export const lastCheck = 'No checks logged'

export const riskSummaries: RiskSummary[] = [
  { level: 'all', label: 'All', count: 0 },
  { level: 'critical', label: 'Critical', count: 0 },
  { level: 'high', label: 'High', count: 0 },
  { level: 'medium', label: 'Medium', count: 0 },
  { level: 'low', label: 'Low', count: 0 },
]

export const attentionItems: AttentionItem[] = []

export const recommendedActions: RecommendedAction[] = [
  { id: 'discount-critical', label: 'Apply 30% discount to critical items' },
  { id: 'bundle-high', label: 'Bundle high-risk items with popular products' },
  { id: 'schedule-check', label: 'Schedule next spoilage check for tomorrow' },
]

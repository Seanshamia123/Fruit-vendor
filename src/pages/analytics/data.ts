export type MetricCard = {
  id: string
  label: string
  value: string
  helper: string
  tone: 'green' | 'blue'
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

export const metrics: MetricCard[] = [
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: 'KSh 0',
    helper: 'Awaiting first transaction',
    tone: 'green',
  },
  {
    id: 'avg-velocity',
    label: 'Avg. Velocity',
    value: '0.0',
    helper: 'items/hour',
    tone: 'blue',
  },
]

export const salesPerformance: SalesPoint[] = []

export const categoryShares: CategorySlice[] = []

export const hourlyPattern: HourlyPoint[] = []

export const insights: Insight[] = []

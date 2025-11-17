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

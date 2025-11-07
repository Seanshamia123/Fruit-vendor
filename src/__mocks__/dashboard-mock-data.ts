export type MetricTone = 'green' | 'blue' | 'purple'

export type DashboardMetric = {
  id: string
  label: string
  value: string
  helper?: string
  tone: MetricTone
}

export type SpoilageTone = 'critical' | 'warning'

export type SpoilageItem = {
  id: string
  name: string
  quantity: string
  timeLeft: string
  tone: SpoilageTone
}

export type SpoilageSummary = {
  lastCheck: string
  items: SpoilageItem[]
}

export type QuickAction = {
  id: string
  label: string
  href: string
  tone: 'blue' | 'green' | 'purple'
  icon: 'plus' | 'cart' | 'cube'
}

export type TopSellingItem = {
  id: string
  name: string
  unitsSold: number
  revenue: string
  progress: number
}

export type ActivityItem = {
  id: string
  description: string
  timeAgo: string
  tone: 'success' | 'info' | 'alert'
}

export const metrics: DashboardMetric[] = [
  {
    id: 'todays-sales',
    label: "Today's Sales",
    value: 'KSh 0',
    helper: 'No transactions yet',
    tone: 'green',
  },
  {
    id: 'items-sold',
    label: 'Items Sold',
    value: '0',
    helper: 'Awaiting first sale',
    tone: 'blue',
  },
  {
    id: 'stock-level',
    label: 'Stock Level',
    value: '--',
    helper: 'Add products to track',
    tone: 'purple',
  },
]

export const spoilageSummary: SpoilageSummary = {
  lastCheck: 'No checks logged',
  items: [],
}

export const quickActions: QuickAction[] = [
  {
    id: 'purchase',
    label: 'New Purchase',
    href: '#',
    tone: 'blue',
    icon: 'plus',
  },
  {
    id: 'sale',
    label: 'Make Sale',
    href: '/sales',
    tone: 'green',
    icon: 'cart',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    href: '#',
    tone: 'purple',
    icon: 'cube',
  },
]

export const topSellingItems: TopSellingItem[] = []

export const recentActivity: ActivityItem[] = []

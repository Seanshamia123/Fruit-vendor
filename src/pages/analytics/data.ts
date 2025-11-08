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
    value: 'KSh 1.28M',
    helper: '+18% vs last week',
    tone: 'green',
  },
  {
    id: 'avg-velocity',
    label: 'Avg. Velocity',
    value: '36.4',
    helper: 'items/hour · +6%',
    tone: 'blue',
  },
]

export const salesPerformance: SalesPoint[] = [
  { label: 'Mon', sales: 182_000, velocity: 32, profit: 58_400 },
  { label: 'Tue', sales: 201_500, velocity: 35, profit: 64_900 },
  { label: 'Wed', sales: 224_200, velocity: 37, profit: 71_400 },
  { label: 'Thu', sales: 198_100, velocity: 33, profit: 62_100 },
  { label: 'Fri', sales: 256_400, velocity: 42, profit: 88_600 },
  { label: 'Sat', sales: 312_800, velocity: 47, profit: 109_400 },
  { label: 'Sun', sales: 237_600, velocity: 39, profit: 79_500 },
]

export const categoryShares: CategorySlice[] = [
  { id: 'veg', label: 'Vegetables', value: 38, color: '#34d399' },
  { id: 'fruit', label: 'Fruits', value: 27, color: '#f97316' },
  { id: 'dairy', label: 'Dairy', value: 18, color: '#60a5fa' },
  { id: 'cereals', label: 'Cereals', value: 9, color: '#a855f7' },
  { id: 'other', label: 'Other', value: 8, color: '#fbbf24' },
]

export const hourlyPattern: HourlyPoint[] = [
  { label: '6am', value: 9 },
  { label: '8am', value: 18 },
  { label: '10am', value: 26 },
  { label: '12pm', value: 33 },
  { label: '2pm', value: 28 },
  { label: '4pm', value: 37 },
  { label: '6pm', value: 41 },
  { label: '8pm', value: 22 },
]

export const insights: Insight[] = [
  {
    id: 'peak-friday',
    title: 'Weekend demand',
    detail: 'Saturday revenue is 24% higher than weekday average. Stock up by Friday evening.',
    tone: 'success',
  },
  {
    id: 'morning-hotspot',
    title: 'Morning rush',
    detail: '10am–12pm contributes 31% of daily orders. Consider time-limited bundles.',
    tone: 'info',
  },
  {
    id: 'fruit-gap',
    title: 'Fruit opportunity',
    detail: 'Fruits trail vegetables by 11 pts. Introduce upsell combos to lift share.',
    tone: 'alert',
  },
]

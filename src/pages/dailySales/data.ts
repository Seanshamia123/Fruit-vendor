import type { ChartSeries } from '../../components/dashboard/TrendChart'

export const dailyTrendSeries: ChartSeries[] = [
  {
    name: 'Actual',
    variant: 'gold',
    values: [45, 60, 70, 68, 55, 62, 75],
  },
]

export const dailyTrendLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const dailyTarget = 60000
export const dailyActual = 40000

export const paymentBreakdown = [
  { id: 'mpesa', label: 'Mpesa', amount: 'KSH 32,000' },
  { id: 'cash', label: 'Cash', amount: 'KSH 8,000' },
]


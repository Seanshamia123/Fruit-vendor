import type { MetricCardProps } from '../../components/dashboard/MetricCard'
import type { ChartSeries } from '../../components/dashboard/TrendChart'
import type { Category } from '../../components/dashboard/CategoryAccordion'

export const metricCards: MetricCardProps[] = [
  {
    label: 'Total balance',
    value: 'KSH 20,000',
    badge: 'Settled',
    tone: 'default',
  },
  {
    label: 'Income today',
    value: 'KSH 5,000',
    badge: 'Up 12%',
    tone: 'positive',
  },
  {
    label: 'Expense today',
    value: 'KSH 7,000',
    badge: 'Includes supplies',
    tone: 'alert',
  },
  {
    label: 'Total profit',
    value: 'KSH 15,000',
    badge: 'Week to date',
    tone: 'positive',
  },
]

export const trendSeries: ChartSeries[] = [
  {
    name: 'Income',
    variant: 'gold',
    values: [12000, 18000, 23000, 23000, 20000, 22000, 26000],
  },
  {
    name: 'Expense',
    variant: 'blue',
    values: [9000, 8500, 12000, 11000, 10000, 9500, 13000],
  },
]

export const trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const incomeCategories: Category[] = [
  { label: 'Bananas', value: 'KSH 6,000' },
  { label: 'Mangoes', value: 'KSH 4,500' },
  { label: 'Oranges', value: 'KSH 3,800' },
]

export const expenseCategories: Category[] = [
  { label: 'Farmer payments', value: 'KSH 3,200' },
  { label: 'Transport & logistics', value: 'KSH 2,100' },
  { label: 'Market fees', value: 'KSH 1,700' },
]

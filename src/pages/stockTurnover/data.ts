import type { ChartSeries } from '../../components/dashboard/TrendChart'
import type { KeySku, KeySkuColumns } from './types'

export const turnoverSeries: ChartSeries[] = [
  {
    name: 'Turnover rate',
    variant: 'gold',
    values: [40, 55, 70, 72, 60, 58, 68],
  },
]

export const turnoverLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const keySkus: KeySku[] = [
  { category: 'Apple', variety: 'Gala', grade: '1', batchDate: '27/09/2024' },
  { category: 'Banana', variety: 'Cavendish', grade: '2', batchDate: '27/09/2024' },
  { category: 'Mango', variety: 'Alphonso', grade: '3', batchDate: '27/09/2024' },
  { category: 'Tomatoes', variety: 'Reddish', grade: '4', batchDate: '27/09/2024' },
  { category: 'Oranges', variety: 'Lafy', grade: '6', batchDate: '27/09/2024' },
]

export const keySkuColumns: KeySkuColumns = [
  { key: 'category', label: 'Category' },
  { key: 'variety', label: 'Variety' },
  { key: 'grade', label: 'Grade' },
  { key: 'batchDate', label: 'Batch Date' },
]

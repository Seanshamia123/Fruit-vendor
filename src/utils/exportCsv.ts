import type { SalesPoint } from '../pages/analytics/data'

export const exportSalesTrendCsv = (rows: SalesPoint[], filename = 'sales_trend.csv') => {
  const header = 'day,sales,velocity,profit\n'
  const body = rows
    .map((row) => `${row.label},${row.sales},${row.velocity},${row.profit}`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

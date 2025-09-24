import styles from '../StockTurnover.module.css'
import type { KeySku, KeySkuColumns } from '../types'

// Render table listing the top stock keeping units driving turnover.
const KeySkuTable = ({ rows, columns }: { rows: KeySku[]; columns: KeySkuColumns }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.category}-${row.batchDate}`}>
              <td>{row.category}</td>
              <td>{row.variety}</td>
              <td className={styles.gradeCell}>{row.grade}</td>
              <td className={styles.dateCell}>{row.batchDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default KeySkuTable


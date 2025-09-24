import PeriodFilterCard from '../../components/analytics/PeriodFilterCard'
import TrendChart from '../../components/dashboard/TrendChart'
import MainLayout from '../../layouts/MainLayout'
import styles from './StockTurnover.module.css'
import KeySkuTable from './components/KeySkuTable'
import { keySkuColumns, keySkus, turnoverLabels, turnoverSeries } from './data'

const StockTurnover = () => {
  return (
    <MainLayout title="Stock Turnover" subtitle="Monitor stock movement at a glance">
      <div className={styles.contentStack}>
        <PeriodFilterCard label="Period selector" value="Past 7 days" />

        <TrendChart
          title="Stock Turnover Rate"
          subtitle=""
          series={turnoverSeries}
          labels={turnoverLabels}
          xAxisLabel="Turnover"
          yAxisLabel="Stock"
        />

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Key SKUs</h2>
            <a href="#" className={styles.sectionLink}>
              View all
            </a>
          </div>
          <KeySkuTable rows={keySkus} columns={keySkuColumns} />
        </div>
      </div>
    </MainLayout>
  )
}

export default StockTurnover


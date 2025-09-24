import PeriodFilterCard from '../../components/analytics/PeriodFilterCard'
import TrendChart from '../../components/dashboard/TrendChart'
import MainLayout from '../../layouts/MainLayout'
import styles from './DailySales.module.css'
import ActualTargetChart from './components/ActualTargetChart'
import PaymentBreakdownList from './components/PaymentBreakdownList'
import { dailyActual, dailyTarget, dailyTrendLabels, dailyTrendSeries, paymentBreakdown } from './data'

const DailySales = () => {
  return (
    <MainLayout title="Daily Sales" subtitle="Track performance against your goals">
      <div className={styles.pageStack}>
        <PeriodFilterCard label="Period selector" value="Today" />

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Actual vs Target sales</h2>
          </div>
          <ActualTargetChart actual={dailyActual} target={dailyTarget} />
        </div>

        <TrendChart title="Daily Sales Trend" series={dailyTrendSeries} labels={dailyTrendLabels} xAxisLabel="Days" yAxisLabel="Sales" />

        <PaymentBreakdownList
          title="Sales Breakdown"
          linkLabel="Sales Summary"
          linkHref="/sales-summary"
          items={paymentBreakdown}
        />
      </div>
    </MainLayout>
  )
}

export default DailySales


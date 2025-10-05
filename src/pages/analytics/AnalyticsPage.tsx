import MainLayout from '../../layouts/MainLayout'
import MetricCard from '../../components/analytics/MetricCard'
import SalesPerformanceCard from '../../components/analytics/SalesPerformanceCard'
import CategoryShareCard from '../../components/analytics/CategoryShareCard'
import HourlyPatternCard from '../../components/analytics/HourlyPatternCard'
import InsightsCard from '../../components/analytics/InsightsCard'
import { exportSalesTrendCsv } from '../../utils/exportCsv'
import styles from './AnalyticsPage.module.css'
import { categoryShares, hourlyPattern, insights, metrics, salesPerformance } from './data'

const AnalyticsPage = () => {
  return (
    <MainLayout
      title="Analytics"
      subtitle="Business insights and trends"
      trailing={
        <div className={styles.controlRow}>
          <button type="button" className={styles.controlButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
            This Week
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={() => exportSalesTrendCsv(salesPerformance)}
            aria-label="Download CSV"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m6 11 6 6 6-6" />
              <path d="M5 21h14" />
            </svg>
          </button>
        </div>
      }
    >
      <div className={styles.pageShell}>
        <section className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </section>

        <SalesPerformanceCard points={salesPerformance} />

        <div className={styles.bottomRow}>
          <CategoryShareCard slices={categoryShares} />
          <HourlyPatternCard points={hourlyPattern} />
        </div>

        <InsightsCard items={insights} />
      </div>
    </MainLayout>
  )
}

export default AnalyticsPage

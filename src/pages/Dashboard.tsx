import CategoryAccordion from '../components/dashboard/CategoryAccordion'
import KpiHighlight from '../components/dashboard/KpiHighlight'
import MetricsGrid from '../components/dashboard/MetricsGrid'
import TrendChart from '../components/dashboard/TrendChart'
import MainLayout from '../layouts/MainLayout'
import styles from './Dashboard.module.css'
import {
  expenseCategories,
  incomeCategories,
  metricCards,
  trendLabels,
  trendSeries,
} from './dashboard/data'

const Dashboard = () => {
  return (
    <MainLayout title="Your Dashboard" subtitle="Quick view of your shop today">
      <MetricsGrid metrics={metricCards} />

      <TrendChart
        title="Income vs Expense (Past 7 days)"
        subtitle="Last synced 12 mins ago"
        series={trendSeries}
        labels={trendLabels}
        className={styles.sectionSpacing}
      />

      <section className={`${styles.sectionSpacing} ${styles.sectionStack}`}>
        <KpiHighlight title="Your KPIs" label="Net Cashflow" value="Ksh 20,000" />

        <CategoryAccordion title="Income Categories" items={incomeCategories} defaultOpen />
        <CategoryAccordion title="Expense Categories" items={expenseCategories} />
      </section>
    </MainLayout>
  )
}

export default Dashboard

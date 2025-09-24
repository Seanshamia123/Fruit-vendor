import MainLayout from '../../layouts/MainLayout'
import styles from './SalesSummary.module.css'
import HeroSummaryCard from './components/HeroSummaryCard'
import TopSellingList from './components/TopSellingList'
import { heroSummary, topSellingItems } from './data'

const SalesSummary = () => (
  <MainLayout title="Sales Summary" subtitle="Understand what is driving your revenue">
    <div className={styles.pageStack}>
      <HeroSummaryCard title="Sales Summary" periodLabel={heroSummary.period} amount={heroSummary.amount} />
      <TopSellingList title="Top selling Items" linkLabel="See full breakdown" linkHref="/sales-summary" items={topSellingItems} />
    </div>
  </MainLayout>
)

export default SalesSummary


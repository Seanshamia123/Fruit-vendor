import MainLayout from '../layouts/MainLayout'
import SummaryStatCard from '../components/dashboard/SummaryStatCard'
import SpoilageAlertCard from '../components/dashboard/SpoilageAlertCard'
import QuickActionButton from '../components/dashboard/QuickActionButton'
import TopSellingList from '../components/dashboard/TopSellingList'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import EmptyStateCard from '../components/emptyState/EmptyStateCard'
import styles from './Dashboard.module.css'
import {
  metrics,
  quickActions,
  recentActivity,
  spoilageSummary,
  topSellingItems,
} from './dashboard/data'

const Dashboard = () => {
  return (
    <MainLayout title="Dashboard" subtitle="Welcome back!">
      <section className={styles.metricGrid}>
        {metrics.map((metric) => (
          <SummaryStatCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className={styles.sectionSpacing}>
        {spoilageSummary.items.length ? (
          <SpoilageAlertCard summary={spoilageSummary} />
        ) : (
          <EmptyStateCard
            icon="alert"
            title="No spoilage checks yet"
            description="Log your first quality check to track at-risk stock."
            actionLabel="Schedule Check"
          />
        )}
      </section>

      <section className={`${styles.sectionSpacing} ${styles.quickActions}`}>
        {quickActions.map((action) => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </section>

      <section className={`${styles.sectionSpacing} ${styles.bottomGrid}`}>
        {topSellingItems.length ? (
          <TopSellingList items={topSellingItems} />
        ) : (
          <EmptyStateCard
            icon="star"
            title="No top items yet"
            description="Track sales for a few days to highlight what sells fastest."
            actionLabel="Start Selling"
          />
        )}
        {recentActivity.length ? (
          <ActivityFeed items={recentActivity} />
        ) : (
          <EmptyStateCard
            icon="wallet"
            title="No activity recorded"
            description="New updates will appear here after your first transactions."
            actionLabel="Log Activity"
          />
        )}
      </section>
    </MainLayout>
  )
}

export default Dashboard

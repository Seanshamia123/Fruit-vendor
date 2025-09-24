import MainLayout from '../../layouts/MainLayout'
import styles from './SpoilageCheck.module.css'
import { lastCheck, spoilageLegend } from './data'

const SpoilageCheck = () => (
  <MainLayout title="Spoilage Check" subtitle="Stay ahead of perishable losses">
    <div className={styles.pageStack}>
      <section className={styles.statusCard}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Last check:</span>
          <span className={styles.statusValue}>{lastCheck}</span>
        </div>
      </section>

      <section className={styles.statusCard}>
        <div className={styles.legendList}>
          {spoilageLegend.map((item) => (
            <div key={item.id} className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles[item.className as keyof typeof styles]}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.priorityList}>
        Priority Items
      </section>
    </div>
  </MainLayout>
)

export default SpoilageCheck


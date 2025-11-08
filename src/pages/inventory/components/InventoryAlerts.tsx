import { useState, useEffect } from 'react'
import { inventoryApi, productApi } from '../../../services/api'
import styles from '../Inventory.module.css'

type AlertPlan = {
  id: string
  productName: string
  current: number
  threshold: number
  status: 'Good' | 'Low' | 'Out' | 'Spoiled'
  enabled: boolean
}

const InventoryAlerts = () => {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [dailySummary, setDailySummary] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [plans, setPlans] = useState<AlertPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const [inventory, products] = await Promise.all([
          inventoryApi.list(),
          productApi.list(),
        ])

        const alertPlans: AlertPlan[] = inventory.map((inv) => {
          const product = products.find((p) => p.id === inv.product_id)
          const threshold = 10 // Default threshold, could be configurable

          let status: AlertPlan['status'] = 'Good'
          if (inv.quantity === 0) status = 'Out'
          else if (inv.quantity < threshold) status = 'Low'

          // TODO: Check for spoilage when backend supports expiry dates
          // if (inv.expiry_date) {
          //   const daysUntilExpiry = Math.ceil(
          //     (new Date(inv.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          //   )
          //   if (daysUntilExpiry <= 0) status = 'Spoiled'
          //   else if (daysUntilExpiry <= 3 && status === 'Good') status = 'Low'
          // }

          return {
            id: inv.id.toString(),
            productName: product?.name || `Product ${inv.product_id}`,
            current: inv.quantity,
            threshold,
            status,
            enabled: true,
          }
        })

        setPlans(alertPlans)
      } catch (error) {
        console.error('Failed to fetch inventory data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventoryData()
  }, [])
  const enabledCount = plans.filter((plan) => plan.enabled).length
  const statusBreakdown = plans.reduce(
    (acc, plan) => {
      if (plan.status === 'Good') acc.healthy += 1
      else if (plan.status === 'Low') acc.low += 1
      else if (plan.status === 'Out' || plan.status === 'Spoiled') acc.critical += 1
      if (!plan.enabled) acc.muted += 1
      return acc
    },
    { healthy: 0, low: 0, critical: 0, muted: 0 }
  )

  const togglePlan = (id: string) => {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, enabled: !plan.enabled } : plan)))
  }

  if (isLoading) {
    return (
      <div className={styles.alertsRoot}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading alert plans...</div>
      </div>
    )
  }

  return (
    <div className={styles.alertsRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Stock Alerts</h2>
          <p className={styles.pageSubtitle}>Fine-tune when you hear about low or expiring stock</p>
        </div>
        <span className={styles.badgeMuted}>{enabledCount} active alerts</span>
      </header>

      <section className={styles.cardSurface}>
        <h3 className={styles.sectionTitle}>Alert Preferences</h3>
        <div className={styles.toggleList}>
          <label className={styles.toggleRow}>
            <span>
              <strong>Enable alerts</strong>
              <span className={styles.metaMuted}>Receive updates about inventory thresholds</span>
            </span>
            <button type="button" className={`${styles.toggleSwitch} ${alertsEnabled ? styles.toggleSwitchOn : ''}`} onClick={() => setAlertsEnabled((value) => !value)}>
              <span className={styles.toggleThumb} />
            </button>
          </label>
          <label className={styles.toggleRow}>
            <span>
              <strong>Daily digest</strong>
              <span className={styles.metaMuted}>Send a summary email each day</span>
            </span>
            <button type="button" className={`${styles.toggleSwitch} ${dailySummary ? styles.toggleSwitchOn : ''}`} onClick={() => setDailySummary((value) => !value)}>
              <span className={styles.toggleThumb} />
            </button>
          </label>
          <label className={styles.toggleRow}>
            <span>
              <strong>Alert sounds</strong>
              <span className={styles.metaMuted}>Play a chime when an alert appears</span>
            </span>
            <button type="button" className={`${styles.toggleSwitch} ${soundEnabled ? styles.toggleSwitchOn : ''}`} onClick={() => setSoundEnabled((value) => !value)}>
              <span className={styles.toggleThumb} />
            </button>
          </label>
        </div>
      </section>

      <div className={styles.metricStripHighlight}>
        <div className={`${styles.metricCard} ${styles.metricAccentGreen}`}>
          <span className={styles.metricValue}>{statusBreakdown.healthy}</span>
          <span className={styles.metricLabel}>Healthy</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentAmber}`}>
          <span className={styles.metricValue}>{statusBreakdown.low}</span>
          <span className={styles.metricLabel}>Low</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentRed}`}>
          <span className={styles.metricValue}>{statusBreakdown.critical}</span>
          <span className={styles.metricLabel}>Critical</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentSoft}`}>
          <span className={styles.metricValue}>{statusBreakdown.muted}</span>
          <span className={styles.metricLabel}>Muted</span>
        </div>
      </div>

      <section className={styles.cardSurface}>
        <h3 className={styles.sectionTitle}>Per-product plans</h3>
        {plans.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 16 24 8l16 8v16l-16 8-16-8V16z" />
                <path d="M8 16 24 24l16-8" />
                <path d="M24 24v16" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>No alert plans yet</p>
            <p className={styles.emptySubtitle}>Alert templates will appear here after you create products or enable alerts.</p>
          </div>
        ) : (
          <div className={styles.alertPlanList}>
            {plans.map((plan) => (
              <article key={plan.id} className={styles.alertPlanCard}>
                <header className={styles.alertPlanHeader}>
                  <div>
                    <h4 className={styles.productName}>{plan.productName}</h4>
                    <p className={styles.productMeta}>Current: {plan.current} • Threshold: {plan.threshold} • Status: {plan.status}</p>
                  </div>
                  <button type="button" className={`${styles.toggleSwitchSmall} ${plan.enabled ? styles.toggleSwitchOn : ''}`} onClick={() => togglePlan(plan.id)} aria-label="Toggle plan">
                    <span className={styles.toggleThumb} />
                  </button>
                </header>
                <div className={styles.sliderGroup}>
                  <label>
                    <span>Low-stock warning</span>
                    <div className={styles.sliderTrack}>
                      <div className={styles.sliderFill} style={{ width: `${(plan.threshold / 20) * 100}%` }} />
                    </div>
                    <span className={styles.sliderValue}>{plan.threshold} units</span>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.infoPanelBlue}>
        <h3 className={styles.sectionTitle}>How alert levels work</h3>
        <ul className={styles.tipList}>
          <li><strong>Healthy (Green):</strong> Stock is above the safe threshold.</li>
          <li><strong>Low (Amber):</strong> Stock has dropped below the safe level.</li>
          <li><strong>Critical (Red):</strong> Stock is at a critical level—reorder immediately.</li>
        </ul>
        <button type="button" className={styles.primaryAction}>Save alert settings</button>
      </section>
    </div>
  )
}

export default InventoryAlerts

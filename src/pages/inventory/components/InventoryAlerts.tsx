import { useState } from 'react'
import styles from '../Inventory.module.css'
import { alertPlans } from '../data'

const InventoryAlerts = () => {
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [dailySummary, setDailySummary] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [plans, setPlans] = useState(alertPlans)
  const enabledCount = plans.filter((plan) => plan.enabled).length
  const statusBreakdown = plans.reduce(
    (acc, plan) => {
      if (plan.status === 'Good') acc.healthy += 1
      else if (plan.status === 'Low') acc.low += 1
      else if (plan.status === 'Out' || plan.status === 'Critical' || plan.status === 'Spoiled') acc.critical += 1
      if (!plan.enabled) acc.muted += 1
      return acc
    },
    { healthy: 0, low: 0, critical: 0, muted: 0 }
  )

  const togglePlan = (id: string) => {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, enabled: !plan.enabled } : plan)))
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
                    <h4 className={styles.productName}>{plan.name}</h4>
                    <p className={styles.productMeta}>{plan.category} • Status: {plan.status}</p>
                  </div>
                  <button type="button" className={`${styles.toggleSwitchSmall} ${plan.enabled ? styles.toggleSwitchOn : ''}`} onClick={() => togglePlan(plan.id)} aria-label="Toggle plan">
                    <span className={styles.toggleThumb} />
                  </button>
                </header>
                <div className={styles.sliderGroup}>
                  <label>
                    <span>Low-stock warning</span>
                    <div className={styles.sliderTrack}>
                      <div className={styles.sliderFill} style={{ width: `${plan.reorderThreshold}%` }} />
                    </div>
                    <span className={styles.sliderValue}>{plan.reorderThreshold} kg</span>
                  </label>
                  <label>
                    <span>Critical alert level</span>
                    <div className={styles.sliderTrack}>
                      <div className={styles.sliderFillCritical} style={{ width: `${plan.criticalThreshold}%` }} />
                    </div>
                    <span className={styles.sliderValue}>{plan.criticalThreshold} kg</span>
                  </label>
                  <label>
                    <span>Expiry warning</span>
                    <div className={styles.sliderTrack}>
                      <div className={styles.sliderFillSoft} style={{ width: `${plan.expiryWarningDays * 10}%` }} />
                    </div>
                    <span className={styles.sliderValue}>{plan.expiryWarningDays} days</span>
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

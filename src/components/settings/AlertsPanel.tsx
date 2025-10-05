
import styles from './AlertsPanel.module.css'

export type AlertSettingKey = 'stock' | 'summary' | 'rewards' | 'spoilage'
export type PricingSettingKey = 'quickPricing' | 'autoSuggest'

type AlertsCopy = {
  alertsTitle: string
  pricingTitle: string
  alertOptions: { id: AlertSettingKey; label: string; hint: string }[]
  pricingOptions: { id: PricingSettingKey; label: string; hint: string }[]
  sliderLabel: (value: number) => string
  sliderRange: { min: string; max: string }
}

type AlertsPanelProps = {
  alertSettings: Record<AlertSettingKey, boolean>
  pricingMargin: number
  pricingSettings: Record<PricingSettingKey, boolean>
  copy: AlertsCopy
  onToggleAlert: (key: AlertSettingKey) => void
  onTogglePricing: (key: PricingSettingKey) => void
  onMarginChange: (value: number) => void
}

const AlertsPanel = ({
  alertSettings,
  pricingMargin,
  pricingSettings,
  copy,
  onToggleAlert,
  onTogglePricing,
  onMarginChange,
}: AlertsPanelProps) => (
  <section className={styles.grid}>
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6v6" />
            <path d="M12 16h.01" />
            <path d="M5 19h14l-7-14-7 14z" />
          </svg>
        </span>
        <h2 className={styles.cardTitle}>{copy.alertsTitle}</h2>
      </header>

      <div className={styles.toggleList}>
        {copy.alertOptions.map((item) => {
          const active = alertSettings[item.id]
          return (
            <label key={item.id} className={styles.toggleRow}>
              <div>
                <p className={styles.toggleLabel}>{item.label}</p>
                <p className={styles.toggleHint}>{item.hint}</p>
              </div>
              <button
                type="button"
                className={`${styles.switch} ${active ? styles.switchOn : ''}`}
                role="switch"
                aria-checked={active}
                onClick={() => onToggleAlert(item.id)}
              >
                <span className={styles.switchThumb} />
              </button>
            </label>
          )
        })}
      </div>
    </div>

    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1v22" />
            <path d="M8 5h8" />
            <path d="M6 9.5C7 8 8.6 7 10.3 7h3.4c2.8 0 5 2.2 5 5s-2.2 5-5 5h-2" />
          </svg>
        </span>
        <h2 className={styles.cardTitle}>{copy.pricingTitle}</h2>
      </header>

      <div className={styles.pricingBlock}>
        <label className={styles.pricingLabel}>
          {copy.sliderLabel(pricingMargin)}
          <span className={styles.sliderRange}>
            <span>{copy.sliderRange.min}</span>
            <span>{copy.sliderRange.max}</span>
          </span>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={pricingMargin}
            onChange={(event) => onMarginChange(Number(event.target.value))}
            className={styles.sliderInput}
            aria-label={copy.sliderLabel(pricingMargin)}
          />
        </label>

        {copy.pricingOptions.map((item) => {
          const active = pricingSettings[item.id]
          return (
            <label key={item.id} className={styles.toggleRow}>
              <div>
                <p className={styles.toggleLabel}>{item.label}</p>
                <p className={styles.toggleHint}>{item.hint}</p>
              </div>
              <button
                type="button"
                className={`${styles.switch} ${active ? styles.switchOn : ''}`}
                role="switch"
                aria-checked={active}
                onClick={() => onTogglePricing(item.id)}
              >
                <span className={styles.switchThumb} />
              </button>
            </label>
          )
        })}
      </div>
    </div>
  </section>
)

export default AlertsPanel

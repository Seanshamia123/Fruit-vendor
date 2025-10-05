
import styles from './LoyaltyRulesPanel.module.css'

type LoyaltyCopy = {
  title: string
  subtitle: string
  description: string
}

type LoyaltyRulesPanelProps = {
  enabled: boolean
  onToggle: () => void
  copy: LoyaltyCopy
}

const LoyaltyRulesPanel = ({ enabled, onToggle, copy }: LoyaltyRulesPanelProps) => (
  <section className={styles.card}>
    <header className={styles.cardHeader}>
      <div>
        <h2 className={styles.cardTitle}>{copy.title}</h2>
        <p className={styles.cardSubtitle}>{copy.subtitle}</p>
      </div>
      <button
        type="button"
        className={`${styles.switch} ${enabled ? styles.switchOn : ''}`}
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
      >
        <span className={styles.switchThumb} />
      </button>
    </header>
    <p className={styles.cardDescription}>{copy.description}</p>
  </section>
)

export default LoyaltyRulesPanel

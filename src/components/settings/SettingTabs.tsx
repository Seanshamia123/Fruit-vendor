
import styles from './SettingTabs.module.css'

export type TabKey = 'profile' | 'display' | 'alerts' | 'pricing'

type SettingTabsProps = {
  value: TabKey
  onChange: (value: TabKey) => void
  labels: Record<TabKey, string>
}

const SettingTabs = ({ value, onChange, labels }: SettingTabsProps) => (
  <div className={styles.tabStrip} role="tablist">
    {(Object.keys(labels) as TabKey[]).map((key) => (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={value === key}
        className={`${styles.tabChip} ${value === key ? styles.tabChipActive : ''}`}
        onClick={() => onChange(key)}
      >
        {labels[key]}
      </button>
    ))}
  </div>
)

export default SettingTabs

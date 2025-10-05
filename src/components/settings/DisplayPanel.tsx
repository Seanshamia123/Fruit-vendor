
import styles from './DisplayPanel.module.css'

type DisplayOptionKey = 'charts' | 'text' | 'table'

type DisplayPanelProps = {
  activeOption: DisplayOptionKey
  onSelect: (value: DisplayOptionKey) => void
  copy: {
    title: string
    subtitle: string
    options: { key: DisplayOptionKey; title: string; description: string }[]
  }
}

const iconForOption = (key: DisplayOptionKey) => {
  switch (key) {
    case 'charts':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18" />
          <path d="M21 21H3" />
          <path d="M7 12l3 3 4-5 4 6" />
          <path d="m15 6-1 2 4 2" />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16" />
          <path d="M4 12h16" />
          <path d="M4 20h16" />
        </svg>
      )
    case 'table':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V3" />
        </svg>
      )
  }
}

const DisplayPanel = ({ activeOption, onSelect, copy }: DisplayPanelProps) => (
  <section className={styles.card}>
    <header className={styles.cardHeader}>
      <span className={styles.cardIcon} aria-hidden>{iconForOption('charts')}</span>
      <div>
        <h2 className={styles.cardTitle}>{copy.title}</h2>
        <p className={styles.cardSubtitle}>{copy.subtitle}</p>
      </div>
    </header>

    <div className={styles.optionList}>
      {copy.options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`${styles.optionButton} ${activeOption === option.key ? styles.optionButtonActive : ''}`}
          onClick={() => onSelect(option.key)}
          aria-pressed={activeOption === option.key}
        >
          <div className={styles.optionIcon} aria-hidden>
            {iconForOption(option.key)}
          </div>
          <div>
            <p className={styles.optionTitle}>{option.title}</p>
            <p className={styles.optionDescription}>{option.description}</p>
          </div>
        </button>
      ))}
    </div>
  </section>
)

export type { DisplayOptionKey }
export default DisplayPanel

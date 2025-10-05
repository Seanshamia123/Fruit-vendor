
import styles from './QuickPromoPanel.module.css'

type QuickPromoPanelProps = {
  products: string[]
  selected: string[]
  maxSelection?: number
  onToggle: (product: string) => void
  copy: {
    title: string
    subtitle: string
    hintText: string
    selectedLabel: string
    emptyLabel: string
  }
}

const QuickPromoPanel = ({ products, selected, maxSelection = 6, onToggle, copy }: QuickPromoPanelProps) => {
  const remaining = maxSelection - selected.length
  const hasSelection = selected.length > 0

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.headerIcon} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h18l-3 12H6L3 8z" />
              <path d="m16 3-4 5-4-5" />
            </svg>
          </span>
          <div>
            <h2 className={styles.cardTitle}>{copy.title}</h2>
            <p className={styles.cardSubtitle}>{copy.subtitle}</p>
          </div>
        </div>
        <span className={styles.selectionHint}>{copy.hintText}</span>
      </header>

      <div className={styles.productGrid}>
        {products.map((name) => {
          const isSelected = selected.includes(name)
          const disabled = !isSelected && remaining === 0
          return (
            <button
              key={name}
              type="button"
              className={`${styles.productChip} ${isSelected ? styles.productChipActive : ''}`}
              onClick={() => onToggle(name)}
              aria-pressed={isSelected}
              disabled={disabled}
            >
              {name}
            </button>
          )
        })}
      </div>

      <div className={styles.selectionSummary}>
        <span className={styles.selectionLabel}>{hasSelection ? copy.selectedLabel : copy.emptyLabel}</span>
        {hasSelection && (
          <div className={styles.selectionTags}>
            {selected.map((name) => (
              <span key={name} className={styles.selectionTag}>{name}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default QuickPromoPanel

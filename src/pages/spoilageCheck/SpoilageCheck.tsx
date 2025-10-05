import { useMemo, useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import EmptyStateCard from '../../components/emptyState/EmptyStateCard'
import styles from './SpoilageCheck.module.css'
import {
  attentionItems,
  lastCheck,
  recommendedActions,
  riskSummaries,
  type RiskLevel,
} from './data'

const riskOrder: RiskLevel[] = ['critical', 'high', 'medium', 'low']

const renderRiskIcon = (risk: RiskLevel) => {
  switch (risk) {
    case 'critical':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3 2.5 19a1 1 0 0 0 .87 1.5h17.26a1 1 0 0 0 .87-1.5L12 3z" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16.5" r="1" />
        </svg>
      )
    case 'high':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v18" />
          <path d="M5 12h14" />
        </svg>
      )
    case 'medium':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 6v6l4 4" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
    case 'low':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 13 10 18 19 7" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}

const pillClass: Record<RiskLevel, string> = {
  critical: styles.pillCritical,
  high: styles.pillHigh,
  medium: styles.pillMedium,
  low: styles.pillLow,
}

const iconBackground: Record<RiskLevel, string> = {
  critical: '#fee2e2',
  high: '#fef3c7',
  medium: '#fef9c3',
  low: '#dcfce7',
}

const SpoilageCheck = () => {
  const [query, setQuery] = useState('')
  const [activeRisk, setActiveRisk] = useState<RiskLevel | 'all'>('all')

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return attentionItems.filter((item) => {
      if (activeRisk !== 'all' && item.risk !== activeRisk) return false
      if (!normalizedQuery) return true
      const haystack = `${item.name} ${item.category}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [query, activeRisk])

  const subtitle = useMemo(() => {
    const baseCount = riskSummaries.find((summary) => summary.level === activeRisk)?.count ?? attentionItems.length
    if (baseCount === 0) {
      return 'No items flagged yet'
    }
    const filterDescription = activeRisk === 'all' ? 'items flagged' : `${activeRisk} risk`
    return `${filteredItems.length} of ${baseCount} ${filterDescription}`
  }, [filteredItems.length, activeRisk])

  const headerAction = (
    <button type="button" className={styles.completeButton}>
      Start Check
    </button>
  )

  return (
    <MainLayout title="Spoilage Alerts" subtitle={`Last check: ${lastCheck}`} trailing={headerAction}>
      <div className={styles.pageStack}>
        <section className={styles.searchCard}>
          <div className={styles.searchRow}>
            <label className={styles.searchInputWrapper} htmlFor="spoilage-search">
              <span aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                id="spoilage-search"
                type="search"
                placeholder="Search items..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button type="button" className={styles.filterButton} aria-label="Filter options">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h16" />
                <path d="M6 12h12" />
                <path d="M10 19h4" />
              </svg>
            </button>
          </div>

          <div className={styles.segmentGroup}>
            {riskSummaries.map((summary) => (
              <button
                key={summary.label}
                type="button"
                className={`${styles.segmentButton} ${activeRisk === summary.level ? styles.segmentButtonActive : ''}`}
                onClick={() => setActiveRisk(summary.level)}
              >
                <strong>{summary.count}</strong>&nbsp;{summary.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.summaryGrid}>
          {riskSummaries
            .filter((summary) => summary.level !== 'all')
            .sort((a, b) => riskOrder.indexOf(a.level as RiskLevel) - riskOrder.indexOf(b.level as RiskLevel))
            .map((summary) => (
              <article key={summary.label} className={`${styles.summaryCard} ${styles[`summary${summary.label.charAt(0).toUpperCase() + summary.label.slice(1)}` as const]}`}>
                <span className={styles.summaryCount}>{summary.count}</span>
                {summary.label}
              </article>
            ))}
        </section>

        <section className={styles.attentionCard}>
          <header className={styles.attentionHeader}>
            <div>
              <h2 className={styles.attentionTitle}>Items Requiring Attention</h2>
              <p className={styles.attentionSubtitle}>{subtitle}</p>
            </div>
          </header>

          {filteredItems.length ? (
            <ul className={styles.attentionList}>
              {filteredItems.map((item) => (
                <li key={item.id} className={styles.attentionItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemIcon} style={{ background: iconBackground[item.risk] }} aria-hidden>
                    {renderRiskIcon(item.risk)}
                  </span>
                  <div className={styles.itemContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <p className={styles.itemName}>{item.name}</p>
                      <span className={`${styles.itemPill} ${pillClass[item.risk]}`}>{item.timeLeft}</span>
                    </div>
                    <p className={styles.itemMeta}>
                      {item.quantity} • {item.category} • Added: {item.addedOn}
                    </p>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button type="button" className={styles.secondaryButton}>
                    Discount
                  </button>
                  <button type="button" className={styles.dangerButton}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          ) : (
            <EmptyStateCard
              icon="alert"
              title="No spoilage alerts"
              description="Run your first inspection to track freshness risk."
              actionLabel="Start Inspection"
            />
          )
}</section>

        <section className={styles.recommendationsCard}>
          <h2 className={styles.recommendationsTitle}>Recommended Actions</h2>
          <ul className={styles.recommendationsList}>
            {recommendedActions.map((action) => (
              <li key={action.id}>
                <span className={styles.recommendationIcon} aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13 9 17 19 7" />
                  </svg>
                </span>
                <span>{action.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MainLayout>
  )
}

export default SpoilageCheck

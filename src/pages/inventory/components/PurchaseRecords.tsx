import { useMemo, useState } from 'react'
import styles from '../Inventory.module.css'
import type { PurchaseHistory } from '../types'

type PurchaseRecordsProps = {
  records: PurchaseHistory[]
}

const ranges = ['All', '1 week', '1 month', '3 months'] as const

const parseAmount = (value: string) => Number(value.replace(/[^0-9.]/g, '')) || 0
const formatCurrency = (value: number) => `KSh ${value.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

const PurchaseRecords = ({ records }: PurchaseRecordsProps) => {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<(typeof ranges)[number]>('All')

  const filteredHistory = useMemo(() => {
    return records.filter((record) => {
      const query = search.toLowerCase()
      const matchesSearch =
        record.id.toLowerCase().includes(query) ||
        record.supplier.toLowerCase().includes(query) ||
        record.items.some((item) => item.toLowerCase().includes(query))
      // Range filtering could be added when date metadata is dynamic.
      return matchesSearch
    })
  }, [records, search])

  const purchaseCount = filteredHistory.length
  const spendTotalNumber = filteredHistory.reduce((sum, record) => sum + parseAmount(record.total), 0)
  const productVariety = new Set(filteredHistory.flatMap((record) => record.items)).size
  const hasRecords = records.length > 0
  const emptyTitle = hasRecords ? 'No purchases match your search' : 'No purchases recorded yet'
  const emptySubtitle = hasRecords
    ? 'Try a different search term or clear the filters to see results.'
    : 'Once you record supplier purchases, they will appear in this history.'
  const emptyIcon = hasRecords ? (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="22" cy="22" r="12" />
      <path d="M32 32 42 42" />
    </svg>
  ) : (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12h24a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z" />
      <path d="M12 18h24" />
      <path d="M18 24h12" />
      <path d="M18 30h8" />
    </svg>
  )

  return (
    <div className={styles.recordsRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Purchase Records</h2>
          <p className={styles.pageSubtitle}>Track every supplier order and cost</p>
        </div>
        <span className={styles.badgeMuted}>{purchaseCount} records</span>
      </header>

      <div className={styles.searchBarRow}>
        <div className={styles.searchFieldWide}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ID, supplier, or product..."
          />
        </div>
      </div>

      <div className={styles.chipGroupWide}>
        {ranges.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.chip} ${range === option ? styles.chipActive : ''}`}
            onClick={() => setRange(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className={styles.metricStrip}>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{purchaseCount}</span>
          <span className={styles.metricLabel}>Purchases</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentGreen}`}>
          <span className={styles.metricValue}>{formatCurrency(spendTotalNumber)}</span>
          <span className={styles.metricLabel}>Total spend</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{productVariety}</span>
          <span className={styles.metricLabel}>Product types</span>
        </div>
      </div>

      <section className={styles.cardSurface}>
        <h3 className={styles.sectionTitle}>Purchase history</h3>
        {filteredHistory.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>{emptyIcon}</div>
            <p className={styles.emptyTitle}>{emptyTitle}</p>
            <p className={styles.emptySubtitle}>{emptySubtitle}</p>
          </div>
        ) : (
          <div className={styles.listStack}>
            {filteredHistory.map((record) => (
              <article key={record.id} className={styles.purchaseCard}>
                <header className={styles.purchaseHeader}>
                  <div>
                    <span className={styles.smallBadge}>{record.id}</span>
                    <span className={`${styles.statusPill} ${styles.statusGood}`}>{record.status}</span>
                  </div>
                  <span className={styles.metaMuted}>{record.date}</span>
                </header>
                <div className={styles.purchaseBody}>
                  <div>
                    <p className={styles.productName}>{record.supplier}</p>
                    <p className={styles.productMeta}>Total cost {record.total}</p>
                  </div>
                  <button type="button" className={styles.iconButton} aria-label="View purchase">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <div className={styles.tagList}>
                  {record.items.map((item) => (
                    <span key={item} className={styles.smallBadgeMuted}>{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.infoPanelBlue}>
        <h3 className={styles.sectionTitle}>Purchase insights</h3>
        <ul className={styles.tipList}>
          <li><strong>Top supplier:</strong> Mama Joyce Supplies — KSh 4,500 in a single order.</li>
          <li><strong>Most purchased:</strong> Vegetables (Tomatoes, Onions) — 70% of orders.</li>
          <li><strong>Average weekly spend:</strong> KSh 2,900 — up 15% this week.</li>
        </ul>
      </section>
    </div>
  )
}

export default PurchaseRecords

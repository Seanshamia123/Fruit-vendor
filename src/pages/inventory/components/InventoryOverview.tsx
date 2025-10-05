import { useMemo, useState } from 'react'
import styles from '../Inventory.module.css'
import type { InventoryItem } from '../types'
import SearchBar from './SearchBar'

type InventoryOverviewProps = {
  items: InventoryItem[]
}

const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Other'] as const
const statuses = ['All', 'Good', 'Low', 'Out', 'Spoiled'] as const

const filterOptions = [
  { value: 'recent', label: 'Recently added', description: 'Show newest deliveries first' },
  { value: 'quantity', label: 'Lowest quantity', description: 'Highlight items running out' },
  { value: 'expiry', label: 'Expiring soon', description: 'Prioritise items nearing expiry' },
]

const statusToneClass: Record<string, string> = {
  Good: 'statusGood',
  Low: 'statusLow',
  Out: 'statusOut',
  Spoiled: 'statusSpoiled',
}

const countByStatus = (items: InventoryItem[]) => ({
  good: items.filter((item) => item.status === 'Good').length,
  low: items.filter((item) => item.status === 'Low').length,
  out: items.filter((item) => item.status === 'Out').length,
  spoiled: items.filter((item) => item.status === 'Spoiled').length,
})

const InventoryOverview = ({ items }: InventoryOverviewProps) => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All')
  const [activeStatus, setActiveStatus] = useState<(typeof statuses)[number]>('All')
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0].value)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'All' ? true : item.category === activeCategory
      const matchesStatus = activeStatus === 'All' ? true : item.status === activeStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, search, activeCategory, activeStatus])

  const statusTotals = useMemo(() => countByStatus(items), [items])
  const hasItems = items.length > 0
  const emptyTitle = hasItems ? 'No inventory matches these filters' : 'No inventory yet'
  const emptySubtitle = hasItems
    ? 'Clear your search or pick a different category to see items.'
    : 'Record your first stock purchase to populate this view.'
  const emptyIcon = hasItems ? (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="20" cy="20" r="12" />
      <path d="M32 32l12 12" />
    </svg>
  ) : (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14 24 7l14 7v18l-14 7-14-7V14z" />
      <path d="M10 14 24 21l14-7" />
      <path d="M24 21v18" />
    </svg>
  )

  return (
    <div className={styles.overviewRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Inventory Snapshot</h2>
          <p className={styles.pageSubtitle}>See stock levels and freshness at a glance</p>
        </div>
        <button type="button" className={styles.primaryAction}>+ Add Item</button>
      </header>

      <SearchBar
        placeholder="Search inventory..."
        value={search}
        onChange={setSearch}
        filterLabel="Filters"
        filterOptions={filterOptions}
        onFilterSelect={setSelectedFilter}
      />

      <div className={styles.filterChips}>
        <div className={styles.chipGroup}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.chip} ${activeCategory === category ? styles.chipActive : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className={styles.chipGroup}>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`${styles.chip} ${activeStatus === status ? styles.chipActive : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.metricStripHighlight}>
        <div className={`${styles.metricCard} ${styles.metricAccentGreen}`}>
          <span className={styles.metricValue}>{statusTotals.good}</span>
          <span className={styles.metricLabel}>In great shape</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentAmber}`}>
          <span className={styles.metricValue}>{statusTotals.low}</span>
          <span className={styles.metricLabel}>Running low</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentRed}`}>
          <span className={styles.metricValue}>{statusTotals.out}</span>
          <span className={styles.metricLabel}>Out of stock</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricAccentSoft}`}>
          <span className={styles.metricValue}>{statusTotals.spoiled}</span>
          <span className={styles.metricLabel}>Spoiled</span>
        </div>
      </div>

      <section className={styles.cardSurface}>
        <header className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Inventory List ({filteredItems.length})</h3>
          <span className={styles.metaMuted}>Sorted by: {filterOptions.find((option) => option.value === selectedFilter)?.label}</span>
        </header>

        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>{emptyIcon}</div>
            <p className={styles.emptyTitle}>{emptyTitle}</p>
            <p className={styles.emptySubtitle}>{emptySubtitle}</p>
          </div>
        ) : (
          <div className={styles.listStack}>
            {filteredItems.map((item) => (
              <article key={item.id} className={styles.overviewCard}>
                <div className={styles.overviewHeader}>
                  <div>
                    <h4 className={styles.productName}>{item.name}</h4>
                    {item.variety && <span className={styles.smallBadge}>{item.variety}</span>}
                  </div>
                  <span className={`${styles.statusPill} ${styles[statusToneClass[item.status]]}`}>{item.status}</span>
                </div>
                <div className={styles.overviewBody}>
                  <div>
                    <p className={styles.productMeta}>{item.quantity} • {item.category}</p>
                    <p className={styles.productMeta}>{item.unitPrice}</p>
                  </div>
                  <div className={styles.overviewMeta}>
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                        <path d="M9 12h6" />
                        <path d="M12 9v6" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                      {item.addedOn}
                    </span>
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        <path d="M21 3v6h-6" />
                      </svg>
                      Expires {item.expiresOn}
                    </span>
                  </div>
                </div>
                <div className={styles.overviewActions}>
                  <button type="button" className={styles.iconButton} aria-label="View details">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button type="button" className={styles.iconButton} aria-label="Flag issue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M10.29 3H21v8h-7.71l-.58 2H21v8H6.71l-.58-2H15v-8H4.29l-.58-2H15z" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default InventoryOverview

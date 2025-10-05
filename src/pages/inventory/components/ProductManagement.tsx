import { useMemo, useState } from 'react'
import styles from '../Inventory.module.css'
import type { InventoryItem } from '../types'

type ProductManagementProps = {
  items: InventoryItem[]
}

const ProductManagement = ({ items }: ProductManagementProps) => {
  const [search, setSearch] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = showActiveOnly ? item.status !== 'Out' && item.status !== 'Spoiled' : true
      return matchesSearch && matchesStatus
    })
  }, [items, search, showActiveOnly])

  const activeCount = useMemo(
    () => items.filter((item) => item.status !== 'Out' && item.status !== 'Spoiled').length,
    [items]
  )
  const archivedCount = useMemo(() => items.filter((item) => item.status === 'Out').length, [items])
  const varietyCount = useMemo(() => new Set(items.map((item) => item.category)).size, [items])
  const hasItems = items.length > 0
  const emptyTitle = hasItems ? 'No products to show' : 'No products yet'
  const emptySubtitle = hasItems
    ? 'Adjust your search or filter settings to find the items you need.'
    : 'Use the + New Product button to add items to your catalogue.'
  const emptyIcon = hasItems ? (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="21" cy="21" r="12" />
      <path d="m31 31 10 10" />
    </svg>
  ) : (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16 24 8l16 8v16l-16 8-16-8V16z" />
      <path d="M8 16 24 24l16-8" />
      <path d="M24 24v16" />
    </svg>
  )

  return (
    <div className={styles.managementRoot}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Product Management</h2>
          <p className={styles.pageSubtitle}>Add, edit, and organise your catalogue</p>
        </div>
        <button type="button" className={styles.primaryAction}>+ New Product</button>
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
            placeholder="Search products..."
          />
        </div>
        <button
          type="button"
          className={`${styles.filterToggle} ${showActiveOnly ? styles.filterToggleActive : ''}`}
          onClick={() => setShowActiveOnly((s) => !s)}
        >
          {showActiveOnly ? 'Active only' : 'Show all'}
        </button>
      </div>

      <div className={styles.metricStrip}>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{activeCount}</span>
          <span className={styles.metricLabel}>Active products</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{archivedCount}</span>
          <span className={styles.metricLabel}>Archived</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{varietyCount}</span>
          <span className={styles.metricLabel}>Categories</span>
        </div>
      </div>

      <section className={styles.cardSurface}>
        <header className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Product List ({visibleItems.length})</h3>
        </header>

        {visibleItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden>{emptyIcon}</div>
            <p className={styles.emptyTitle}>{emptyTitle}</p>
            <p className={styles.emptySubtitle}>{emptySubtitle}</p>
          </div>
        ) : (
          <div className={styles.listStack}>
            {visibleItems.map((item) => (
              <article key={item.id} className={styles.productCard}>
                <div>
                  <div className={styles.productHeader}>
                    <h4 className={styles.productName}>{item.name}</h4>
                    {item.variety && <span className={styles.smallBadge}>{item.variety}</span>}
                    <span className={styles.statusPill}>{item.status}</span>
                  </div>
                  <p className={styles.productMeta}>
                    {item.category} • {item.quantity} • {item.unitPrice}
                  </p>
                  <p className={styles.productMeta}>Added: {item.addedOn} • Expires: {item.expiresOn}</p>
                </div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.iconButton} aria-label="Edit product">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button type="button" className={styles.iconButton} aria-label="Archive product">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 4H3v4h18V4z" />
                      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
                      <path d="M10 12h4" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.infoPanel}>
        <h3 className={styles.sectionTitle}>Getting started tips</h3>
        <ul className={styles.tipList}>
          <li><strong>Add:</strong> Use the “+ New Product” button to capture new inventory.</li>
          <li><strong>Edit:</strong> Hover over an item and click the pencil icon to update details.</li>
          <li><strong>Archive:</strong> Items you archive stay out of sales but remain in history.</li>
          <li><strong>Search:</strong> Type in the search box to locate products quickly.</li>
        </ul>
      </section>
    </div>
  )
}

export default ProductManagement

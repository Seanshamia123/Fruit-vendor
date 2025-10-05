import { useEffect, useMemo, useState, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import MainLayout from '../../layouts/MainLayout'
import SectionTabs from '../../components/priceManagement/SectionTabs'
import styles from './PricingStrategies.module.css'
import {
  bestPractices,
  pricingPlans,
  productStrategies,
  strategyMetrics,
} from './data'
import { createProductPricing, type ProductRecord } from '../../utils/api'
import { useProductCatalogue } from '../../hooks/useProductCatalogue'

const PRICE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'unit', label: 'Unit price' },
  { value: 'bulk', label: 'Bulk / weight price' },
  { value: 'time', label: 'Time-slot price' },
]

const iconMap: Record<'unit' | 'bulk' | 'time', JSX.Element> = {
  unit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  bulk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden>
      <path d="M3 7h18" />
      <path d="M6 7 4 19h16l-2-12" />
      <path d="M9 11h6" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
}

const inferPriceType = (product: ProductRecord): string => {
  const saleType = product.sale_type.toLowerCase()
  if (saleType.includes('time')) return 'time'
  if (saleType.includes('bulk') || saleType.includes('weight') || saleType.includes('measure')) return 'bulk'
  return 'unit'
}

const PricingStrategies = () => {
  const navigate = useNavigate()
  const { products, loading, error, refresh, status } = useProductCatalogue()
  const [searchTerm, setSearchTerm] = useState('')
  const [drafts, setDrafts] = useState<Record<number, { price: string; priceType: string }>>({})
  const [saveStates, setSaveStates] = useState<Record<number, 'idle' | 'saving' | 'success' | 'error'>>({})

  useEffect(() => {
    if (!products.length) return
    setDrafts((prev) => {
      const next = { ...prev }
      products.forEach((product) => {
        if (!next[product.id]) {
          next[product.id] = { price: '', priceType: inferPriceType(product) }
        }
      })
      return next
    })
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) => {
      const variation = product.variation ?? ''
      return (
        product.name.toLowerCase().includes(query) ||
        variation.toLowerCase().includes(query) ||
        product.unit.toLowerCase().includes(query)
      )
    })
  }, [products, searchTerm])

  const handleDraftChange = (productId: number, key: 'price' | 'priceType', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        price: prev[productId]?.price ?? '',
        priceType: prev[productId]?.priceType ?? 'unit',
        [key]: value,
      },
    }))
  }

  const handleSave = async (product: ProductRecord) => {
    const draft = drafts[product.id]
    if (!draft || !draft.price) {
      setSaveStates((prev) => ({ ...prev, [product.id]: 'error' }))
      return
    }

    const numericPrice = Number(draft.price)
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setSaveStates((prev) => ({ ...prev, [product.id]: 'error' }))
      return
    }

    setSaveStates((prev) => ({ ...prev, [product.id]: 'saving' }))
    try {
      await createProductPricing({
        product_id: product.id,
        price_type: draft.priceType,
        price: numericPrice,
      })
      setSaveStates((prev) => ({ ...prev, [product.id]: 'success' }))
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [product.id]: 'idle' }))
      }, 2500)
    } catch (err) {
      console.error('Failed to save product pricing', err)
      setSaveStates((prev) => ({ ...prev, [product.id]: 'error' }))
    }
  }

  const productCount = products.length || productStrategies.length
  const hasConfiguredStrategies = productStrategies.length > 0
  const isSearching = searchTerm.trim().length > 0
  const noProductsLoaded = status !== 'loading' && products.length === 0 && !isSearching
  const showSearchEmpty = !loading && filteredProducts.length === 0 && isSearching
  const showInitialEmpty = noProductsLoaded && !loading

  return (
    <MainLayout
      title="Pricing Strategies"
      subtitle="Pick the right pricing approach for each product"
      trailing={<span className={styles.countBadge}>{productCount} products configured</span>}
    >
      <div className={styles.pageShell}>
        <div className={styles.tabRow}>
          <SectionTabs />
        </div>
        <section className={styles.metricsGrid}>
          {strategyMetrics.map((metric) => (
            <article key={metric.id} className={styles.metricCard}>
              <span className={styles.metricTitle}>{metric.label}</span>
              <span className={styles.metricValue}>{metric.value}</span>
              <p className={styles.metricDescription}>{metric.description}</p>
            </article>
          ))}
        </section>

        <section className={styles.cardSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Pricing plan types</h2>
              <p className={styles.sectionSubtitle}>Choose the method that fits how you sell</p>
            </div>
          </header>
          <div className={styles.planGrid}>
          {pricingPlans.map((plan) => (
            <article key={plan.id} className={styles.planCard}>
                <span
                  className={`${styles.planIcon} ${
                    plan.icon === 'unit'
                      ? styles.planIconUnit
                      : plan.icon === 'bulk'
                        ? styles.planIconBulk
                        : styles.planIconTime
                  }`}
                >
                  {iconMap[plan.icon]}
                </span>
                <h3 className={styles.planTitle}>{plan.title}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
                <span className={styles.planExample}>{plan.example}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.searchCard}>
          <header className={styles.searchHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Set prices from your stock</h2>
              <p className={styles.sectionSubtitle}>
                Search purchased products, then capture the selling price you will use at the stall.
              </p>
            </div>
            <button type="button" className={styles.refreshButton} onClick={() => refresh()}>
              Refresh list
            </button>
          </header>
          <div className={styles.searchControls}>
            <label className={styles.searchField}>
              <span className={styles.inputLabel}>Search products</span>
              <input
                type="search"
                placeholder="Search by name, unit, or variety"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={styles.searchInput}
              />
            </label>
          </div>

          {loading ? (
            <p className={styles.statusNote}>Loading products…</p>
          ) : showInitialEmpty ? (
            <div className={styles.emptyState}>
              <strong>No products yet.</strong>
              <span>Import purchases or add stock from inventory to start pricing items.</span>
              {error ? <span className={styles.emptyHint}>{error}</span> : null}
              <div className={styles.emptyActions}>
                <Button variant="primary" onClick={() => navigate('/inventory')}>
                  Go to Inventory
                </Button>
                <Button variant="ghost" onClick={() => refresh()}>
                  Retry loading
                </Button>
              </div>
            </div>
          ) : showSearchEmpty ? (
            <div className={styles.emptyState}>
              <strong>No products match your search.</strong>
              <span>Try another term or clear the filter to see the full list.</span>
            </div>
          ) : (
            <div className={styles.searchResultList}>
              {filteredProducts.map((product) => {
                const draft = drafts[product.id] ?? { price: '', priceType: inferPriceType(product) }
                const state = saveStates[product.id] ?? 'idle'
                return (
                  <article key={product.id} className={styles.searchResultRow}>
                    <div className={styles.productMeta}>
                      <h3 className={styles.productTitle}>{product.name}</h3>
                      <div className={styles.productTags}>
                        <span className={styles.productTag}>{product.unit}</span>
                        {product.variation ? <span className={styles.productTagMuted}>{product.variation}</span> : null}
                        <span className={styles.productTag}>{product.sale_type}</span>
                      </div>
                    </div>
                    <div className={styles.draftGrid}>
                      <label className={styles.inputRoot}>
                        <span className={styles.inputLabel}>Selling price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.price}
                          placeholder="e.g. 150"
                          onChange={(event) => handleDraftChange(product.id, 'price', event.target.value)}
                          className={styles.inputField}
                        />
                      </label>
                      <label className={styles.inputRoot}>
                        <span className={styles.inputLabel}>Price type</span>
                        <select
                          value={draft.priceType}
                          onChange={(event) => handleDraftChange(product.id, 'priceType', event.target.value)}
                          className={styles.selectField}
                        >
                          {PRICE_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className={styles.actionCell}>
                        <button
                          type="button"
                          className={styles.saveButton}
                          onClick={() => handleSave(product)}
                          disabled={state === 'saving'}
                        >
                          {state === 'saving' ? 'Saving…' : 'Save price'}
                        </button>
                        {state === 'success' ? (
                          <span className={styles.statusNote}>Saved</span>
                        ) : null}
                        {state === 'error' ? (
                          <span className={`${styles.statusNote} ${styles.errorText}`}>
                            Check the details and try again.
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className={styles.cardSection}>
          <header className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Product strategy management</h2>
              <p className={styles.sectionSubtitle}>Adjust price playbooks per product</p>
            </div>
            <button type="button" className={`${styles.strategyButton} ${styles.strategyButtonSecondary}`}>
              Bulk update
            </button>
          </header>

          <div className={styles.strategyCards}>
            {hasConfiguredStrategies ? (
              productStrategies.map((strategy) => (
                <article
                  key={strategy.id}
                  className={`${styles.strategyCard} ${strategy.highlight ? styles.strategyHighlight : ''}`}
                >
                  <div>
                    <div className={styles.strategyTitle}>{strategy.name}</div>
                    <div className={styles.strategyBadges}>
                      <span className={styles.strategyBadge}>{strategy.activeStrategy}</span>
                      {strategy.availableStrategies
                        .filter((label) => label !== strategy.activeStrategy)
                        .map((label) => (
                          <span key={label} className={styles.strategyBadge}>
                            {label}
                          </span>
                        ))}
                    </div>
                    <p className={styles.strategyDetails}>
                      {strategy.detailLabel}: {strategy.detailValue}
                    </p>
                    {strategy.schedule ? (
                      <div className={styles.scheduleList}>
                        {strategy.schedule.map((slot) => (
                          <div key={slot.label} className={styles.scheduleRow}>
                            <span className={styles.scheduleLabel}>{slot.label}</span>
                            <span className={styles.scheduleValue}>{slot.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className={styles.strategyActions}>
                    <button type="button" className={styles.strategyButton}>
                      Adjust pricing
                    </button>
                    <button type="button" className={`${styles.strategyButton} ${styles.strategyButtonSecondary}`}>
                      View history
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                <strong>No strategies configured.</strong>
                <span>Create your first pricing plan to keep selling prices organised.</span>
                <div className={styles.emptyActions}>
                  <Button variant="primary" onClick={() => navigate('/inventory')}>
                    Add products
                  </Button>
                  <Button variant="ghost" onClick={() => refresh()}>
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={styles.bestPracticesCard}>
          <header className={styles.bestPracticesHeader}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
              <path d="m9 18 3-3 3 3" />
              <path d="M12 2v13" />
              <path d="M5 7h14" />
            </svg>
            Best practices
          </header>
          <div className={styles.bestPracticesList}>
            {bestPractices.map((tip) => (
              <div key={tip.id}>
                <div className={styles.bestPracticeTitle}>{tip.title}</div>
                <p className={styles.bestPracticeDescription}>{tip.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default PricingStrategies

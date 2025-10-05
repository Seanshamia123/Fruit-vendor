import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import MainLayout from '../../layouts/MainLayout'
import SectionTabs from '../../components/priceManagement/SectionTabs'
import styles from './PriceManagementOverview.module.css'
import { priceMetrics, productPrices, pricingTips } from './data'

const PriceManagementOverview = () => {
  const navigate = useNavigate()
  const hasProducts = productPrices.length > 0

  return (
    <MainLayout
      title="Price Management"
      subtitle="Monitor pricing performance across your catalog"
      trailing={<span className={styles.countBadge}>{productPrices.length} products</span>}
    >
      <div className={styles.pageShell}>
        <div className={styles.tabRow}>
          <SectionTabs />
        </div>
        <section className={styles.metricsGrid}>
          {priceMetrics.map((metric) => (
            <article key={metric.id} className={styles.metricCard}>
              <span className={styles.metricValue}>{metric.value}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricDescription}>{metric.description}</span>
            </article>
          ))}
        </section>

        <div className={styles.cardsSection}>
          <section className={styles.priceListCard}>
            <header className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Product Price List</h2>
                <p className={styles.sectionSubtitle}>Current selling prices vs. purchase cost</p>
              </div>
              <button type="button" className={styles.iconButton} aria-label="Sync prices">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 12a9 9 0 0 1 15.45-6M21 12a9 9 0 0 1-15.45 6" />
                  <path d="M3 4v4h4" />
                  <path d="M21 20v-4h-4" />
                </svg>
              </button>
            </header>

            {hasProducts ? (
              <div className={styles.productList}>
                {productPrices.map((product) => (
                  <article key={product.id} className={styles.productCard}>
                    <div className={styles.productMain}>
                      <div className={styles.productTitle}>
                        <span>{product.name}</span>
                        {product.variety && <span className={styles.productVariety}>{product.variety}</span>}
                      </div>
                      <div className={styles.productTags}>
                        <span className={styles.productTag}>{product.pricingMode}</span>
                        {product.tags?.map((tag) => (
                          <span key={tag} className={styles.productTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className={styles.priceDetails}>
                        <div>
                          <span className={styles.priceLabel}>Current price</span>
                          <div className={styles.priceValue}>{product.currentPrice}</div>
                        </div>
                        <div>
                          <span className={styles.priceLabel}>Purchase cost</span>
                          <div className={styles.priceValue}>{product.purchasePrice}</div>
                        </div>
                        <div>
                          <span className={styles.priceLabel}>Margin</span>
                          <div className={`${styles.priceValue} ${styles.priceAccent}`}>{product.marginPercent}</div>
                        </div>
                      </div>
                      <span className={styles.lastUpdated}>Last updated {product.lastUpdated}</span>
                    </div>

                    <div className={styles.actionsColumn}>
                      <div className={styles.actionButtons}>
                        <button type="button" className={styles.iconButton} aria-label="Update price">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button type="button" className={styles.iconButton} aria-label="View history">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 6v6l4 2" />
                            <path d="M3 12a9 9 0 1 0 9-9" />
                            <path d="M3 4v4h4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No prices yet</div>
                <p className={styles.emptySubtitle}>
                  Record your first stock purchase or import products to start tracking selling prices and margins.
                </p>
                <div className={styles.emptyActions}>
                  <Button variant="primary" onClick={() => navigate('/inventory')}>
                    Go to Inventory
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/price-management/strategies')}>
                    Set pricing strategy
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className={styles.tipsCard}>
            <header className={styles.tipHeader}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
                <path d="M12 2a7 7 0 0 0-7 7c0 3.82 4 6 4 6v3a3 3 0 0 0 6 0v-3s4-2.18 4-6a7 7 0 0 0-7-7Z" />
                <path d="M10.5 19h3" />
              </svg>
              Pricing guidance
            </header>
            <div className={styles.tipList}>
              {pricingTips.map((tip) => (
                <div key={tip.id}>
                  <div className={styles.tipItemTitle}>{tip.title}</div>
                  <p className={styles.tipItemDescription}>{tip.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default PriceManagementOverview

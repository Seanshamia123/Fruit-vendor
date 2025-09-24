import styles from '../SalesSummary.module.css'

type HeroSummaryCardProps = {
  title: string
  periodLabel: string
  amount: string
}

const HeroSummaryCard = ({ title, periodLabel, amount }: HeroSummaryCardProps) => (
  <section className={styles.heroCard}>
    <h1>{title}</h1>
    <div className={styles.heroHeader}>
      <span className={styles.heroSelect}>
        {periodLabel}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
      <span className={styles.heroAmount}>{amount}</span>
    </div>
  </section>
)

export default HeroSummaryCard


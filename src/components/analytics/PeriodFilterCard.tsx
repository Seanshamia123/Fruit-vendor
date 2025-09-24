import styles from './PeriodFilterCard.module.css'

type PeriodFilterCardProps = {
  label: string
  value: string
  onClick?: () => void
}

const PeriodFilterCard = ({ label, value, onClick }: PeriodFilterCardProps) => {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.valueButton} onClick={onClick}>
        {value}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  )
}

export default PeriodFilterCard


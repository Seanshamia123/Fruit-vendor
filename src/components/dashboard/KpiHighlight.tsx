import styles from './KpiHighlight.module.css'

export type KpiHighlightProps = {
  title: string
  label: string
  value: string
}

const KpiHighlight = ({ title, label, value }: KpiHighlightProps) => (
  <div className={styles.card}>
    <div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.label}>{label}</p>
    </div>
    <span className={styles.value}>{value}</span>
  </div>
)

export default KpiHighlight

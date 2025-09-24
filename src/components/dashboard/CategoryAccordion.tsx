import styles from './CategoryAccordion.module.css'

export type Category = {
  label: string
  value: string
}

export type CategoryAccordionProps = {
  title: string
  items: Category[]
  defaultOpen?: boolean
}

const CategoryAccordion = ({ title, items, defaultOpen = false }: CategoryAccordionProps) => (
  <details className={`${styles.details} ${styles.accordion}`} open={defaultOpen}>
    <summary className={styles.summary}>
      <span>{title}</span>
      <svg
        className={styles.chevron}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </summary>
    <div className={styles.content}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <span>{item.label}</span>
          <span className={styles.itemValue}>{item.value}</span>
        </div>
      ))}
    </div>
  </details>
)

export default CategoryAccordion

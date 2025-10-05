
import styles from './PricingFooter.module.css'

type PricingFooterCopy = {
  title: string
  description: string
  cancel: string
  save: string
}

type PricingFooterProps = {
  dirty: boolean
  copy: PricingFooterCopy
  onCancel: () => void
  onSave: () => void
}

const PricingFooter = ({ dirty, copy, onCancel, onSave }: PricingFooterProps) => {
  if (!dirty) return null

  return (
    <div className={styles.banner} role="status">
      <div>
        <p className={styles.bannerTitle}>{copy.title}</p>
        <p className={styles.bannerText}>{copy.description}</p>
      </div>
      <div className={styles.bannerActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          {copy.cancel}
        </button>
        <button type="button" className={styles.saveButton} onClick={onSave}>
          {copy.save}
        </button>
      </div>
    </div>
  )
}

export default PricingFooter

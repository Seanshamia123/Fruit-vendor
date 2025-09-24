import React from 'react'
import styles from './Select.module.css'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  const selectClass = [styles.select, className].filter(Boolean).join(' ')

  return (
    <label className={styles.wrapper}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.selectWrapper}>
        <select {...props} className={selectClass}>
          {children}
        </select>
        <span className={styles.caret}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </label>
  )
}

export default Select

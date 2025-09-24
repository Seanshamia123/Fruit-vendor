import React from 'react'
import styles from './SettingRow.module.css'

type Props = {
  label: string
  children: React.ReactNode
}

const SettingRow: React.FC<Props> = ({ label, children }) => {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.field}>{children}</div>
    </div>
  )
}

export default SettingRow

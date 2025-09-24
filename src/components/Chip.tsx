import React from 'react'
import styles from './Chip.module.css'

type ChipProps = {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

const Chip: React.FC<ChipProps> = ({ label, selected = false, onClick, className = '' }) => {
  const classes = [
    styles.chip,
    selected ? styles.chipSelected : styles.chipDefault,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" aria-pressed={selected} className={classes} onClick={onClick}>
      {label}
    </button>
  )
}

export default Chip

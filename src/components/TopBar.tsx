import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './TopBar.module.css'

type TopBarProps = {
  onBack?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onBack }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div className={styles.container}>
      <button aria-label="Go back" onClick={handleBack} className={styles.backButton}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
  )
}

export default TopBar

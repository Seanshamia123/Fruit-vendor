import { Link } from 'react-router-dom'
import type { JSX } from "react"
import styles from './QuickActionButton.module.css'
import type { QuickAction } from '../../pages/dashboard/data'

const toneClass: Record<QuickAction['tone'], string> = {
  blue: styles.toneBlue,
  green: styles.toneGreen,
  purple: styles.tonePurple,
}

const iconMap: Record<QuickAction['icon'], JSX.Element> = {
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M4 5h3l1.5 9.5a1 1 0 0 0 1 .85h8.5a1 1 0 0 0 .98-.8L20 8H7" />
    </svg>
  ),
  cube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7.5 12 3l8 4.5v9l-8 4.5-8-4.5z" />
      <path d="M4 7.5 12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  ),
}

type Props = {
  action: QuickAction
}

const QuickActionButton = ({ action }: Props) => (
  <Link to={action.href} className={`${styles.button} ${toneClass[action.tone]}`}>
    <span className={styles.icon}>{iconMap[action.icon]}</span>
    {action.label}
  </Link>
)

export default QuickActionButton

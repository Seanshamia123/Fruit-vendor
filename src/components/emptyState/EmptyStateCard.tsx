import type { JSX } from 'react'
import styles from './EmptyStateCard.module.css'

type EmptyStateIcon = 'cart' | 'star' | 'alert' | 'box' | 'chart' | 'search' | 'users' | 'wallet'

type EmptyStateCardProps = {
  icon: EmptyStateIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const ICON_STROKE = '#1f2937'

const ICONS: Record<EmptyStateIcon, JSX.Element> = {
  cart: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="32" r="2.6" />
      <circle cx="30" cy="32" r="2.6" />
      <path d="M10 8h4l3.5 18a1.4 1.4 0 0 0 1.4 1.1h13a1.4 1.4 0 0 0 1.36-1.1L35 13H13" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6 5.2 9.8 10.8 1.2-7.8 7.3 1.7 11-9.9-5.4-9.9 5.4 1.7-11-7.8-7.3 10.8-1.2L20 6z" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 4.5 34a1.4 1.4 0 0 0 1.2 2.1h28.6a1.4 1.4 0 0 0 1.2-2.1L20 6z" />
      <path d="M20 15v9" />
      <circle cx="20" cy="28" r="1.6" fill={ICON_STROKE} />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12 20 5l14 7v16l-14 7-14-7V12z" />
      <path d="M6 12 20 19l14-7" />
      <path d="M20 19v17" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 34h26" />
      <path d="M13 26v8" />
      <path d="M20 20v14" />
      <path d="M27 12v22" />
      <path d="M13 20l7-6 5 3 7-6" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="9" />
      <path d="m25 25 8 8" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="14" r="6" />
      <path d="M9 32c0-6 5-11 11-11s11 5 11 11" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 40 40" fill="none" stroke={ICON_STROKE} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12h28a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z" />
      <path d="M27 18h7v8h-7a4 4 0 0 1-4-4 4 4 0 0 1 4-4z" />
      <circle cx="27" cy="22" r="1.6" fill={ICON_STROKE} />
    </svg>
  ),
}

const EmptyStateCard = ({ icon, title, description, actionLabel, onAction, className }: EmptyStateCardProps) => (
  <article className={`${styles.card} ${className ?? ''}`}>
    <div className={styles.iconWrapper}>{ICONS[icon]}</div>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.description}>{description}</p>
    {actionLabel && (
      <button type="button" className={styles.actionButton} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </article>
)

export default EmptyStateCard

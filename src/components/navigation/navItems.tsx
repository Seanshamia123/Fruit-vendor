import type { ReactNode } from 'react'

export type NavItem = {
  label: string
  to: string
  ready: boolean
  icon: ReactNode
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  width: 20,
  height: 20,
} as const

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Your Dashboard',
    to: '/dashboard',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5.5v-6.5h-5V22H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    ),
  },
  {
    label: 'Stock Turnover',
    to: '/stock-turnover',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  {
    label: 'Daily Sales',
    to: '/daily-sales',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M4 19.5V4.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v15" />
        <path d="M4 9.5h16" />
        <path d="m6.5 16 2.5-2 2.5 2 3.5-3" />
      </svg>
    ),
  },
  {
    label: 'Sales Summary',
    to: '/sales-summary',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    ),
  },
  {
    label: 'Inventory Alert',
    to: '/inventory-alert',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    label: 'Spoilage Check',
    to: '/spoilage-check',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M6 22h12" />
        <path d="M6 18V9a6 6 0 0 1 12 0v9" />
        <path d="M9 6h6" />
      </svg>
    ),
  },
]

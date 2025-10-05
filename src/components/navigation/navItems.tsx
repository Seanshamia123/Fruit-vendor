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
    label: 'Analytics',
    to: '/analytics',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M4 19.5h16" />
        <path d="M8 16.5v-5.5" />
        <path d="M12 16.5v-9.5" />
        <path d="M16 16.5v-3.5" />
        <path d="M20 7.5 16 11 13 9 9 12" />
      </svg>
    ),
  },
  {
    label: 'Sales',
    to: '/sales',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M4 7h2l2 10h10l2-8H7" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </svg>
    ),
  },
  {
    label: 'Inventory',
    to: '/inventory',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="M3 9.5 12 4l9 5.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    label: 'Price Management',
    to: '/price-management',
    ready: true,
    icon: (
      <svg {...iconProps}>
        <path d="m7 7 3-3 7 7-7 7-3-3" />
        <path d="M2 12h3" />
        <path d="M12 2v3" />
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

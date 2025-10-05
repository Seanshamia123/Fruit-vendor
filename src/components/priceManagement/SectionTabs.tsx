import { NavLink } from 'react-router-dom'
import styles from './SectionTabs.module.css'

const TABS = [
  { label: 'Overview', to: '/price-management' },
  { label: 'Pricing Strategies', to: '/price-management/strategies' },
  { label: 'Reward Rules', to: '/price-management/rewards' },
]

const SectionTabs = () => {
  return (
    <nav className={styles.tabBar} aria-label="Price management navigation">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            [styles.tabLink, isActive ? styles.tabActive : ''].filter(Boolean).join(' ')
          }
          end={tab.to === '/price-management'}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default SectionTabs

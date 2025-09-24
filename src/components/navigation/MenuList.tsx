import { NavLink } from 'react-router-dom'
import type { NavItem } from './navItems'
import styles from './MenuList.module.css'

export type MenuListProps = {
  items: NavItem[]
  onNavigate?: () => void
}

const MenuList = ({ items, onNavigate }: MenuListProps) => {
  return (
    <div className={styles.menuList}>
      {items.map((item) =>
        item.ready ? (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [styles.menuLink, isActive ? styles.menuLinkActive : ''].filter(Boolean).join(' ')
            }
            onClick={onNavigate}
          >
            <span className={styles.menuIcon}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ) : (
          <div
            key={item.label}
            className={styles.placeholder}
          >
            <span className={styles.placeholderIcon}>{item.icon}</span>
            <div className={styles.placeholderContent}>
              <span className={styles.placeholderLabel}>{item.label}</span>
              <span className={styles.placeholderBadge}>Coming soon</span>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default MenuList

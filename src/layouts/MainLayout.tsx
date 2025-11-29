import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDevice } from '../hooks/useDevice'
import MenuList from '../components/navigation/MenuList'
import { NAV_ITEMS } from '../components/navigation/navItems'
import { useAuth } from '../state/authContext'
import styles from './MainLayout.module.css'

type MainLayoutProps = {
  title: string
  subtitle?: string
  trailing?: ReactNode
  children: ReactNode
}

const MainLayout = ({ title, subtitle, trailing, children }: MainLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const device = useDevice()
  const showDrawer = device !== 'mobile'
  const { signOut, vendor } = useAuth()
  const avatarTriggerRef = useRef<HTMLButtonElement | null>(null)
  const avatarMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMenuOpen(false)
    setAvatarMenuOpen(false)
  }, [location.pathname])

  const menuButtonAriaLabel = useMemo(
    () => (menuOpen ? 'Close navigation menu' : 'Open navigation menu'),
    [menuOpen]
  )

  // ✅ Generate user initials from vendor name
  const userInitials = useMemo(() => {
    if (!vendor?.name) return 'FV'
    return vendor.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [vendor?.name])

  useEffect(() => {
    if (!avatarMenuOpen) return

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node
      if (avatarMenuRef.current?.contains(target)) return
      if (avatarTriggerRef.current?.contains(target)) return
      setAvatarMenuOpen(false)
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAvatarMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickAway)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickAway)
      document.removeEventListener('keydown', handleKey)
    }
  }, [avatarMenuOpen])

  const goToSettings = () => {
    setAvatarMenuOpen(false)
    navigate('/settings')
  }

  const handleSignOut = () => {
    setAvatarMenuOpen(false)
    signOut()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuButtonAriaLabel}
            className={styles.menuButton}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M5 7h14" />
              <path d="M5 12h14" />
              <path d="M5 17h14" />
            </svg>
          </button>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          <div className={styles.avatarSlot}>
            {trailing ?? (
              <div className={styles.avatarMenuWrapper}>
                <button
                  type="button"
                  ref={avatarTriggerRef}
                  aria-haspopup="menu"
                  aria-expanded={avatarMenuOpen}
                  aria-controls="avatar-menu"
                  onClick={() => setAvatarMenuOpen((prev) => !prev)}
                  className={styles.avatarTrigger}
                  title={vendor ? `${vendor.name} (${vendor.email})` : 'User menu'}
                >
                  <span className={styles.avatarFallback}>{userInitials}</span>
                  <svg
                    className={styles.avatarChevron}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <div
                  id="avatar-menu"
                  role="menu"
                  aria-hidden={!avatarMenuOpen}
                  ref={avatarMenuRef}
                  className={`${styles.avatarDropdown} ${avatarMenuOpen ? styles.avatarDropdownOpen : ''}`}
                >
                  {/* ✅ Show user info header */}
                  {vendor && (
                    <>
                      <div className={styles.avatarMenuHeader}>
                        <div className={styles.avatarMenuAvatar}>{userInitials}</div>
                        <div className={styles.avatarMenuInfo}>
                          <div className={styles.avatarMenuName}>{vendor.name}</div>
                          <div className={styles.avatarMenuEmail}>{vendor.email}</div>
                        </div>
                      </div>
                      <div className={styles.avatarMenuDivider} />
                    </>
                  )}

                  <button type="button" role="menuitem" className={styles.avatarMenuItem} onClick={goToSettings}>
                    Settings
                  </button>
                  <button type="button" role="menuitem" className={styles.avatarMenuItem} onClick={handleSignOut}>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

          {device === 'mobile' && menuOpen && (
            // Compact dropdown for handsets so the menu never covers the full screen.
            <div className={styles.mobileMenu}>
              <MenuList items={NAV_ITEMS} onNavigate={() => setMenuOpen(false)} />
            </div>
          )}
        </header>

        <main className={styles.mainContent}>{children}</main>
      </div>

      {showDrawer && (
        <>
          {menuOpen && (
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
              className={styles.overlay}
            />
          )}
          {/* Desktop and tablet view use a sliding drawer so the menu feels anchored to the screen edge. */}
          <aside
            className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
          >
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Menu</span>
              <button
                type="button"
                aria-label="Close navigation menu"
                className={styles.drawerCloseButton}
                onClick={() => setMenuOpen(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="m6 6 12 12" />
                  <path d="m18 6-12 12" />
                </svg>
              </button>
            </div>
            <MenuList items={NAV_ITEMS} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </>
      )}
    </div>
  )
}

export default MainLayout
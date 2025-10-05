import { useEffect, useMemo, useRef, useState } from 'react'
import styles from '../Inventory.module.css'

type FilterOption = {
  value: string
  label: string
  description?: string
}

type SearchBarProps = {
  placeholder: string
  value: string
  onChange: (value: string) => void
  filterLabel?: string
  filterOptions?: FilterOption[]
  onFilterSelect?: (value: string) => void
}

const SearchBar = ({
  placeholder,
  value,
  onChange,
  filterLabel,
  filterOptions,
  onFilterSelect,
}: SearchBarProps) => {
  const hasFilter = Boolean(filterOptions?.length)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const filterText = useMemo(() => filterLabel ?? 'Filter', [filterLabel])

  useEffect(() => {
    if (!filtersOpen) return

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current?.contains(target)) return
      if (buttonRef.current?.contains(target)) return
      setFiltersOpen(false)
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }

    document.addEventListener('mousedown', handleClickAway)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClickAway)
      document.removeEventListener('keydown', handleKey)
    }
  }, [filtersOpen])

  return (
    <div className={styles.searchRow}>
      <div className={styles.searchField}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>

      {hasFilter && (
        <div className={styles.filterWrapper}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={filtersOpen}
            ref={buttonRef}
            className={`${styles.filterButton} ${filtersOpen ? styles.filterButtonActive : ''}`}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 5h16" />
              <path d="M7 11h10" />
              <path d="M10 17h4" />
            </svg>
            <span>{filterText}</span>
          </button>

          {filtersOpen && filterOptions && (
            <div className={styles.filterDropdown} ref={dropdownRef} role="menu">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.filterDropdownItem}
                  onClick={() => {
                    onFilterSelect?.(option.value)
                    setFiltersOpen(false)
                  }}
                >
                  <span>{option.label}</span>
                  {option.description && <span className={styles.filterDescription}>{option.description}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
